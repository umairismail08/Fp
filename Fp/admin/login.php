<?php
session_start();
include __DIR__ . '/../backend/db.php'; // Your database connection

// Set headers for JSON response
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// Read JSON input from the frontend
$data = json_decode(file_get_contents("php://input"), true);

$email_or_username = $data['email'] ?? '';
$password = $data['password'] ?? '';

// --- Step 1: Check if it's an ADMIN ---
$stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username = ?");
$stmt->bind_param("s", $email_or_username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $admin = $result->fetch_assoc();
    if (password_verify($password, $admin['password'])) {
        // ADMIN LOGIN SUCCESS
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        // Send a success response with a redirect instruction for the admin
        echo json_encode(["success" => true, "role" => "admin", "redirect" => "/fp/admin/panel.php"]);
        exit;
    }
}
$stmt->close();

// --- Step 2: If not an admin, check if it's a USER ---
$stmt = $conn->prepare("SELECT id, name, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email_or_username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    if (password_verify($password, $user['password'])) {
        // USER LOGIN SUCCESS
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_name'] = $user['name'];
        // Send a success response with user data
        echo json_encode([
            "success" => true, 
            "role" => "user",
            "user" => [
                "id" => $user['id'],
                "name" => $user['name'],
                "email" => $user['email']
            ]
        ]);
        exit;
    }
}
$stmt->close();

// --- Step 3: If no match was found, login fails ---
echo json_encode(["success" => false, "message" => "Invalid email or password."]);

$conn->close();
?>