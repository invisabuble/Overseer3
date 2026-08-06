<?php

session_start();

require '/private/user_util.php';

header('Content-Type: application/json');

// Check if the user is logged in — same check used across the rest of the site.
if (!isset($_SESSION['username'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

// Find the user's permissions.
$stmt = db_execute("CALL get_user_permissions(?)", [$_SESSION['username']]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
$perm = $row['permissions'];

// TODO: gate this behind whatever permission level should be allowed to
// reflash devices, once you decide what that looks like in your permissions
// scheme, e.g.:
// if ($perm !== 'admin') {
//     http_response_code(403);
//     echo json_encode(['error' => 'Insufficient permissions']);
//     exit;
// }

if (!isset($_FILES['firmware']) || $_FILES['firmware']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No firmware file uploaded, or upload error']);
    exit;
}

$device_id = isset($_POST['device_id']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $_POST['device_id']) : 'unknown';

$firmware_dir = '/var/www/overseer/firmware';
$max_size = 4 * 1024 * 1024; // 4MB, generous headroom over current ~1.2MB binary

$tmp_path = $_FILES['firmware']['tmp_name'];
$size = $_FILES['firmware']['size'];
$orig_name = $_FILES['firmware']['name'];

// Basic validation: extension and size only. This isn't a substitute for the
// ESP32 bootloader's own image validation (magic byte, checksum), but keeps
// obviously-wrong files from landing in the firmware directory at all.
if (strtolower(pathinfo($orig_name, PATHINFO_EXTENSION)) !== 'bin') {
    http_response_code(400);
    echo json_encode(['error' => 'Firmware file must be a .bin']);
    exit;
}

if ($size > $max_size) {
    http_response_code(413);
    echo json_encode(['error' => 'Firmware file too large']);
    exit;
}

$filename = $device_id . '_' . time() . '.bin';
$dest_path = $firmware_dir . '/' . $filename;

if (!move_uploaded_file($tmp_path, $dest_path)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save firmware file']);
    exit;
}

$url = 'https://' . $_SERVER['SERVER_NAME'] . '/firmware/' . $filename;

echo json_encode([
    'url' => $url,
    'filename' => $filename,
    'size' => $size,
    'uploaded_by' => $_SESSION['username'],
]);