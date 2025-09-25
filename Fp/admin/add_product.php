<?php
session_start();
if (!isset($_SESSION['admin_id'])) { header("Location: login.html"); exit; }
include __DIR__ . '/../backend/db.php';

$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';
$price = $_POST['price'] ?? 0;

// assign to proper variables before binding
$discount_price = ($_POST['discount_price'] !== '' && $_POST['discount_price'] !== null) 
    ? (float)$_POST['discount_price'] 
    : null;

$rating = ($_POST['rating'] !== '' && $_POST['rating'] !== null) 
    ? (float)$_POST['rating'] 
    : null;

// handle image upload
$imageName = null;
if (!empty($_FILES['image']['name'])) {
    $file = $_FILES['image'];
    $allowed = ['jpg','jpeg','png','gif'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) die("Invalid image type.");
    if ($file['size'] > 2 * 1024 * 1024) die("Image too large.");

    $imageName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $target = __DIR__ . '/../Frontend/images/' . $imageName;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        die("Failed to move uploaded file.");
    }
}

// ✅ IMPORTANT: use "sssddds" for string,string,string,double,double,double,string
$stmt = $conn->prepare("INSERT INTO products (name, description, category, price, discount_price, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssddds",
    $name,
    $description,
    $category,
    $price,
    $discount_price,
    $rating,
    $imageName
);

if ($stmt->execute()) {
    header("Location: panel.php");
    exit;
} else {
    echo "Error: " . $stmt->error;
}
if ($stmt->execute()) {
    $_SESSION['message'] = "Product added successfully!";
    $_SESSION['msg_type'] = "success";
    header("Location: panel.php");
    exit;
} else {
    $_SESSION['message'] = "Error adding product: " . $stmt->error;
    $_SESSION['msg_type'] = "error";
    header("Location: panel.php");
    exit;
}
