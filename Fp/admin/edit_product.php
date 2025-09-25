<?php
session_start();
if (!isset($_SESSION['admin_id'])) { header("Location: login.html"); exit; }
include __DIR__ . '/../backend/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = intval($_GET['id'] ?? 0);
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $res = $stmt->get_result();
    if (!$product = $res->fetch_assoc()) {
        echo "Product not found";
        exit;
    }
    ?>
    <!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="admin_style.css"><title>Edit</title></head><body>
    <h2>Edit Product #<?php echo $product['id']; ?></h2>
    <form method="POST" enctype="multipart/form-data">
      <input type="hidden" name="id" value="<?php echo $product['id']; ?>">
      <label>Name</label><input name="name" value="<?php echo htmlspecialchars($product['name']); ?>">
      <label>Description</label><textarea name="description"><?php echo htmlspecialchars($product['description']); ?></textarea>
      <label>Category</label><input name="category" value="<?php echo htmlspecialchars($product['category']); ?>">
      <label>Price</label><input type="number" step="0.01" name="price" value="<?php echo htmlspecialchars($product['price']); ?>">
      <label>Discount Price</label><input type="number" step="0.01" name="discount_price" value="<?php echo htmlspecialchars($product['discount_price']); ?>">
      <label>Rating</label><input type="number" step="0.1" max="5" min="0" name="rating" value="<?php echo htmlspecialchars($product['rating']); ?>">
      <label>Replace image (optional)</label><input type="file" name="image" accept="image/*">
      <br><button type="submit">Update</button>
      <a href="panel.php">Back</a>
    </form>
    </body></html>
    <?php
    exit;
}

// POST — update
// POST — update
$id = intval($_POST['id'] ?? 0);
$name = $_POST['name'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';
$price = (float)($_POST['price'] ?? 0);

// prepare variables for bind_param (must be real variables, not expressions)
$discount_price = ($_POST['discount_price'] !== '' && $_POST['discount_price'] !== null) 
    ? (float)$_POST['discount_price'] 
    : null;

$rating = ($_POST['rating'] !== '' && $_POST['rating'] !== null) 
    ? (float)$_POST['rating'] 
    : null;

// handle optional new image
$imageName = null;
if (!empty($_FILES['image']['name'])) {
    $file = $_FILES['image'];
    $allowed = ['jpg','jpeg','png','gif'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) die("Invalid image type.");
    if ($file['size'] > 2 * 1024 * 1024) die("Image too large.");
    $imageName = time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $target = __DIR__ . '/../Frontend/images/' . $imageName;
    if (!move_uploaded_file($file['tmp_name'], $target)) die("Failed to move file.");

    // delete old image
    $old = $conn->query("SELECT image FROM products WHERE id=$id")->fetch_assoc()['image'] ?? '';
    if ($old && file_exists(__DIR__ . '/../Frontend/images/' . $old)) unlink(__DIR__ . '/../Frontend/images/' . $old);
}

// ✅ use variables directly
$stmt = $conn->prepare("UPDATE products 
    SET name=?, description=?, category=?, price=?, discount_price=?, rating=?, image=COALESCE(?, image) 
    WHERE id=?");
$stmt->bind_param("sssdddsi",
    $name,
    $description,
    $category,
    $price,
    $discount_price,
    $rating,
    $imageName,
    $id
);

if ($stmt->execute()) {
    header("Location: panel.php");
    exit;
} else {
    echo "Error: " . $stmt->error;
}

?>
