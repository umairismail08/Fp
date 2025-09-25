<?php
session_start();
include 'db.php';

header("Content-Type: application/json");

// Check if a user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

// Use a prepared statement to securely fetch addresses
$stmt = $conn->prepare("SELECT * FROM user_addresses WHERE user_id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$addresses = [];
while ($row = $result->fetch_assoc()) {
    $addresses[] = $row;
}

echo json_encode(['success' => true, 'addresses' => $addresses]);

$stmt->close();
$conn->close();
?>