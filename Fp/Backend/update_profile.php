<?php
session_start();
include 'db.php'; // Your database connection

// Set headers
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// Check if the user is logged in by checking the session
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Error: User not logged in.']);
    exit;
}
$userId = $_SESSION['user_id'];

// Get the updated data from the JavaScript fetch call
$data = json_decode(file_get_contents("php://input"), true);
$newName = $data['name'] ?? '';
$newEmail = $data['email'] ?? '';

// Basic validation
if (empty($newName) || empty($newEmail)) {
    echo json_encode(['success' => false, 'message' => 'Name and email cannot be empty.']);
    exit;
}

// Use a secure prepared statement to UPDATE the database
$stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
$stmt->bind_param("ssi", $newName, $newEmail, $userId);

if ($stmt->execute()) {
    // If the database update is successful, send back a success message
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error updating profile in database.']);
}

$stmt->close();
$conn->close();
?>