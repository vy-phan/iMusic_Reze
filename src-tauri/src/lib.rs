use image::imageops::FilterType;
use serde::{Deserialize, Serialize};
use serde_json::json;
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, FilePath};
use tauri_plugin_store::StoreExt;
use walkdir::WalkDir;

// --- Định nghĩa Struct ---
#[derive(Serialize, Deserialize, Debug, Clone)]
struct Song {
    title: String,
    artist: String,
    duration: String,
    path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct PlaylistItem {
    position: u32,
    song_path: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Playlist {
    id: String,
    name: String,
    cover_image_path: Option<String>,
    songs: Vec<PlaylistItem>,
}

// --- Hàm Helper Tối Ưu Hóa Ảnh ---
fn process_playlist_image(source_path_str: &str, music_folder: &Path) -> Result<String, String> {
    let source_path = PathBuf::from(source_path_str);
    // Removed unused variable 'extension
    // Tạo một tên file duy nhất cho ảnh bìa để tránh trùng lặp
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let new_file_name = format!("cover_{}.webp", timestamp);
    let target_path = music_folder.join(&new_file_name);

    // Mở, resize, và lưu ảnh
    let img = image::open(&source_path).map_err(|e| format!("Không thể mở file ảnh: {}", e))?;
    let resized_img = img.resize(500, 500, FilterType::Lanczos3); // Resize về 500x500
    resized_img
        .save_with_format(&target_path, image::ImageFormat::WebP)
        .map_err(|e| format!("Không thể lưu ảnh đã tối ưu: {}", e))?;

    println!("🖼️ Đã tối ưu và lưu ảnh bìa tại: {:?}", target_path);

    // Trả về tên file để lưu vào playlist
    Ok(new_file_name)
}

// --- Command Mới: create_playlist ---
#[tauri::command]
fn create_playlist(
    app: AppHandle,
    name: String,
    cover_image: Option<String>,
    song_paths: Vec<String>,
) -> Result<(), String> {
    let music_folder_str = get_music_folder(app.clone()).ok_or("Chưa cấu hình thư mục nhạc")?;
    let music_folder = PathBuf::from(music_folder_str);

    // Xử lý ảnh bìa nếu có
    let cover_image_path = match cover_image {
        Some(path) => Some(process_playlist_image(&path, &music_folder)?),
        None => None,
    };

    // Tạo danh sách bài hát với vị trí
    let playlist_items: Vec<PlaylistItem> = song_paths
        .into_iter()
        .enumerate()
        .map(|(index, path)| PlaylistItem {
            position: index as u32,
            song_path: path,
        })
        .collect();

    // Tạo playlist mới
    let new_playlist = Playlist {
        id: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_millis()
            .to_string(),
        name,
        cover_image_path,
        songs: playlist_items,
    };

    // Đọc, cập nhật, và lưu lại file playlists.json
    let store = app.store("playlists.json").map_err(|e| e.to_string())?;
    let mut playlists: Vec<Playlist> = store
        .get("playlists")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    playlists.push(new_playlist);

    store.set("playlists", json!(playlists));
    store.save().map_err(|e| e.to_string())?;

    println!("✅ Đã tạo và lưu playlist thành công.");

    Ok(())
}

#[tauri::command]
fn update_playlist_songs(
    app: AppHandle,
    playlist_id: String,
    new_song_paths: Vec<String>,
) -> Result<(), String> {
    let store = app.store("playlists.json").map_err(|e| e.to_string())?;
    let mut all_playlists: Vec<Playlist> = store
        .get("playlists")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    // Tìm playlist cần cập nhật
    if let Some(playlist) = all_playlists.iter_mut().find(|p| p.id == playlist_id) {
        // Tạo lại danh sách bài hát với vị trí mới
        let updated_songs: Vec<PlaylistItem> = new_song_paths
            .into_iter()
            .enumerate()
            .map(|(index, path)| PlaylistItem {
                position: index as u32,
                song_path: path,
            })
            .collect();

        // Gán danh sách mới cho playlist
        playlist.songs = updated_songs;
    } else {
        return Err(format!("Không tìm thấy playlist với ID: {}", playlist_id));
    }

    // Lưu lại toàn bộ file playlists.json
    store.set("playlists", json!(all_playlists));
    store.save().map_err(|e| e.to_string())?;

    println!(
        "✅ Đã cập nhật thứ tự bài hát cho playlist ID: {}",
        playlist_id
    );
    Ok(())
}

#[tauri::command]
fn load_playlists(app: AppHandle) -> Result<Vec<Playlist>, String> {
    let store = app.store("playlists.json").map_err(|e| e.to_string())?;

    let playlists = store
        .get("playlists")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    Ok(playlists)
}

#[tauri::command]
fn load_music_library(app: AppHandle) -> Result<Vec<Song>, String> {
    // Mở file store, dữ liệu được tự động tải vào bộ nhớ
    let store = app.store("library.json").map_err(|e| e.to_string())?;

    // Lấy danh sách bài hát từ key "songs"
    match store.get("songs") {
        Some(songs_value) => {
            let songs: Vec<Song> =
                serde_json::from_value(songs_value.clone()).unwrap_or_else(|_| vec![]);
            Ok(songs)
        }
        None => Ok(vec![]),
    }
}

#[tauri::command]
fn get_playlist_details(app: AppHandle, id: String) -> Result<Playlist, String> {
    let all_playlists = load_playlists(app)?;

    all_playlists
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| format!("Không tìm thấy playlist với ID: {}", id))
}

#[tauri::command]
fn delete_playlist(app: AppHandle, id: String) -> Result<(), String> {
    let store = app.store("playlists.json").map_err(|e| e.to_string())?;
    let mut all_playlists: Vec<Playlist> = store
        .get("playlists")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    // Tìm playlist cần xóa để lấy thông tin ảnh bìa
    let playlist_to_delete = all_playlists.iter().find(|p| p.id == id);

    if let Some(playlist) = playlist_to_delete {
        // Nếu có ảnh bìa, tiến hành xóa file ảnh
        if let Some(cover_image) = &playlist.cover_image_path {
            if let Some(music_folder_str) = get_music_folder(app.clone()) {
                let music_folder = PathBuf::from(music_folder_str);
                let image_path = music_folder.join(cover_image);
                if image_path.exists() {
                    if let Err(e) = fs::remove_file(&image_path) {
                        eprintln!("Lỗi khi xóa file ảnh bìa {:?}: {}", image_path, e);
                        // Không return lỗi, chỉ ghi log để việc xóa playlist vẫn tiếp tục
                    } else {
                        println!("🗑️ Đã xóa file ảnh bìa: {:?}", image_path);
                    }
                }
            }
        }
    } else {
        return Err(format!("Không tìm thấy playlist với ID: {} để xóa.", id));
    }

    // Lọc ra danh sách mới không chứa playlist cần xóa
    all_playlists.retain(|p| p.id != id);

    // Lưu lại danh sách mới
    store.set("playlists", json!(all_playlists));
    store.save().map_err(|e| e.to_string())?;

    println!("✅ Đã xóa playlist với ID: {}", id);
    Ok(())
}

#[tauri::command]
fn add_songs_to_playlist(
    app: AppHandle,
    playlist_id: String,
    song_paths_to_add: Vec<String>,
) -> Result<(), String> {
    // 1. Mở file store
    let store = app.store("playlists.json").map_err(|e| e.to_string())?;
    
    // 2. Tải toàn bộ danh sách playlists hiện có
    let mut all_playlists: Vec<Playlist> = store
        .get("playlists")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    // 3. Tìm playlist cần cập nhật (dưới dạng mutable để có thể sửa đổi)
    if let Some(playlist) = all_playlists.iter_mut().find(|p| p.id == playlist_id) {
        
        // 4. Lấy số lượng bài hát hiện tại để xác định vị trí bắt đầu cho các bài hát mới
        let current_song_count = playlist.songs.len() as u32;

        // 5. Tạo các PlaylistItem mới từ các đường dẫn được cung cấp
        let new_items: Vec<PlaylistItem> = song_paths_to_add
            .into_iter()
            .enumerate()
            .map(|(index, path)| PlaylistItem {
                // Vị trí mới = số lượng hiện tại + chỉ số của bài hát mới
                position: current_song_count + (index as u32),
                song_path: path,
            })
            .collect();

        // 6. Nối các bài hát mới vào cuối danh sách hiện tại
        playlist.songs.extend(new_items);
        
    } else {
        // Trả về lỗi nếu không tìm thấy playlist
        return Err(format!("Không tìm thấy playlist với ID: {}", playlist_id));
    }

    // 7. Lưu lại toàn bộ danh sách playlists đã được cập nhật
    store.set("playlists", json!(all_playlists));
    store.save().map_err(|e| e.to_string())?;

    println!(
        "✅ Đã thêm bài hát vào playlist ID: {}",
        playlist_id
    );
    Ok(())
}

#[tauri::command]
fn select_music_folder(app: tauri::AppHandle) {
    let dialog = app.dialog();
    let app_handle = app.clone();

    dialog.file().pick_folder(move |result| {
        if let Some(path) = result {
            let folder_str = match path {
                FilePath::Path(p) => p.display().to_string(),
                FilePath::Url(u) => u.to_string(),
            };

            println!("🎵 Selected folder: {}", folder_str);

            if let Ok(store) = app_handle.store("settings.json") {
                let _ = store.set("music_folder", Value::String(folder_str.clone()));
                let _ = store.save();
                println!("💾 Saved folder to settings.json");
            } else {
                eprintln!("❌ Failed to open settings store");
            }
        }
    });
}

#[tauri::command]
fn get_music_folder(app: tauri::AppHandle) -> Option<String> {
    if let Ok(store) = app.store("settings.json") {
        if let Some(path) = store
            .get("music_folder")
            .and_then(|v| v.as_str().map(|s| s.to_string()))
        {
            return Some(path);
        }
    }
    None
}

#[tauri::command]
fn get_music_folder_size(app: AppHandle) -> Result<String, String> {
    // Lấy đường dẫn thư mục từ settings, tái sử dụng logic cũ
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let folder_path_str = store
        .get("music_folder")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or("Chưa cấu hình thư mục nhạc.")?; // Trả về lỗi nếu không tìm thấy

    let folder_path = PathBuf::from(folder_path_str);

    // Dùng WalkDir để duyệt qua tất cả các file và thư mục con
    let mut total_size: u64 = 0;
    for entry in WalkDir::new(folder_path).min_depth(1) {
        match entry {
            Ok(entry) => {
                // Chỉ tính dung lượng của các file
                if entry.metadata().map(|m| m.is_file()).unwrap_or(false) {
                    total_size += entry.metadata().unwrap().len();
                }
            }
            Err(e) => {
                // Ghi log lỗi nhưng vẫn tiếp tục, ví dụ do không có quyền truy cập
                eprintln!("Lỗi khi duyệt file: {}", e);
            }
        }
    }

    // Trả về dung lượng đã được định dạng
    Ok(format_size(total_size))
}

fn format_size(bytes: u64) -> String {
    const KB: f64 = 1024.0;
    const MB: f64 = KB * 1024.0;
    const GB: f64 = MB * 1024.0;
    const TB: f64 = GB * 1024.0;

    let size = bytes as f64;

    if size >= TB {
        format!("{:.2} TB", size / TB)
    } else if size >= GB {
        format!("{:.2} GB", size / GB)
    } else if size >= MB {
        format!("{:.2} MB", size / MB)
    } else if size >= KB {
        format!("{:.2} KB", size / KB)
    } else {
        format!("{} Bytes", size)
    }
}

#[tauri::command]
fn save_music_file(
    app: AppHandle,
    title: String,
    artist: String,
    file_path: String,
) -> Result<Song, String> {
    // 🔹 Lấy thư mục nhạc từ settings
    let store = app.store("settings.json").map_err(|e| e.to_string())?;
    let folder = store
        .get("music_folder")
        .and_then(|v| v.as_str().map(|s| s.to_string()))
        .ok_or("⚠️ Chưa cấu hình thư mục nhạc")?;

    let source = PathBuf::from(&file_path);
    let file_name = source
        .file_name()
        .ok_or("❌ Không thể lấy tên file")?
        .to_string_lossy()
        .to_string();

    let target_path = PathBuf::from(&folder).join(&file_name);

    // ✅ Copy file
    fs::copy(&source, &target_path).map_err(|e| format!("Không thể copy file: {}", e))?;

    // ✅ Lấy thời lượng
    let duration = match get_audio_duration(&target_path) {
        Ok(d) => d,
        Err(e) => {
            eprintln!("⚠️ Lỗi khi lấy thời lượng: {:?}", e);
            "00:00".to_string()
        }
    };

    println!("🎵 Đã lưu file: {:?}", target_path);

    // --- Phần lưu metadata ---
    let new_song = Song {
        title,
        artist,
        duration,
        path: target_path.to_string_lossy().to_string(),
    };

    let store_library = app.store("library.json").map_err(|e| e.to_string())?;

    let mut songs: Vec<Song> = match store_library.get("songs") {
        Some(songs_value) => serde_json::from_value(songs_value.clone()).unwrap_or_else(|_| vec![]),
        None => vec![],
    };

    songs.push(new_song.clone());

    // ✅ ĐÃ SỬA LỖI: .set() không trả về Result, nên ta xóa phần xử lý lỗi.
    store_library.set("songs", json!(songs));

    // Dòng .save() này là đúng vì nó trả về Result
    store_library.save().map_err(|e| e.to_string())?;

    println!("💾 Đã cập nhật thư viện với bài hát mới.");

    Ok(new_song)
}

/// Lấy độ dài bài hát và format thành mm:ss
fn get_audio_duration(path: &PathBuf) -> Result<String, symphonia::core::errors::Error> {
    use std::fs::File;
    use symphonia::core::formats::FormatOptions;
    use symphonia::core::io::MediaSourceStream;
    use symphonia::core::meta::MetadataOptions;

    let file = File::open(path)?;
    let mss = MediaSourceStream::new(Box::new(file), Default::default());
    let probed = symphonia::default::get_probe().format(
        &Default::default(),
        mss,
        &FormatOptions::default(),
        &MetadataOptions::default(),
    )?;

    let format = probed.format;
    let track = format
        .default_track()
        .ok_or_else(|| symphonia::core::errors::Error::DecodeError("Không có track"))?;

    let duration_secs = if let (Some(frames), Some(rate)) =
        (track.codec_params.n_frames, track.codec_params.sample_rate)
    {
        frames as f64 / rate as f64
    } else {
        0.0
    };

    let minutes = (duration_secs / 60.0).floor() as u32;
    let seconds = (duration_secs % 60.0).round() as u32;

    Ok(format!("{:02}:{:02}", minutes, seconds))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_media::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_media::init())
        .invoke_handler(tauri::generate_handler![
            select_music_folder,
            get_music_folder,
            save_music_file,
            load_music_library,
            get_music_folder_size,
            create_playlist,
            get_playlist_details,
            load_playlists,
            delete_playlist,
            update_playlist_songs,
            add_songs_to_playlist
        ])
        .run(tauri::generate_context!())
        .expect("❌ Error while running Tauri application");
}
