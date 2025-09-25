<?php
// --- Start of Clean Output Code ---
// Turn off error reporting to the browser to prevent breaking JSON
error_reporting(0); 
ini_set('display_errors', 0);

// Use output buffering to catch any stray output
ob_start();
// --- End of Clean Output Code ---

session_start();
include 'db.php';

// Set headers
header("Content-Type: application/json");

$response = []; // Prepare a response array

if (!isset($_SESSION['user_id'])) {
    $response = ['success' => false, 'message' => 'User not logged in'];
} else {
    $userId = $_SESSION['user_id'];
    $data = json_decode(file_get_contents("php://input"), true);

    $address1 = $data['addressLine1'] ?? '';
    $address2 = $data['addressLine2'] ?? null;
    $city = $data['city'] ?? '';
    $state = $data['state'] ?? '';
    $zip = $data['zipCode'] ?? '';

    if (empty($address1) || empty($city) || empty($state) || empty($zip)) {
        $response = ['success' => false, 'message' => 'Please fill all required fields.'];
    } else {
        $stmt = $conn->prepare("INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isssss", $userId, $address1, $address2, $city, $state, $zip);

        if ($stmt->execute()) {
            $response = ['success' => true, 'message' => 'Address added successfully.'];
        } else {
            // Log the real error for your own debugging, but don't send it to the user
            // error_log("Add Address DB Error: " . $stmt->error);
            $response = ['success' => false, 'message' => 'Error saving address to the database.'];
        }
        $stmt->close();
    }
    $conn->close();
}

// --- Final Clean Output ---
ob_end_clean(); // Clear any captured warnings or notices
echo json_encode($response); // Send the final, clean JSON response
?>