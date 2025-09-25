<?php
session_start();
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.html");
    exit;
}
include __DIR__ . '/../backend/db.php';

// show flash message if exists
if (isset($_SESSION['message'])) {
    $msg = $_SESSION['message'];
    $msgType = $_SESSION['msg_type'] ?? 'info';
    echo "<div style='padding:10px;margin:10px 0;border-radius:4px;
        background:".($msgType==='success'?'#d4edda':($msgType==='error'?'#f8d7da':'#cce5ff')).";
        color:".($msgType==='success'?'#155724':($msgType==='error'?'#721c24':'#004085')).";
        border:1px solid ".($msgType==='success'?'#c3e6cb':($msgType==='error'?'#f5c6cb':'#b8daff')).";'>
        $msg
    </div>";
    unset($_SESSION['message'], $_SESSION['msg_type']);
}
if (!isset($_SESSION['admin_id'])) {
    header("Location: login.html");
    exit;
}
include __DIR__ . '/../backend/db.php';
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Admin Panel - FreshMart</title>
  <link rel="stylesheet" href="admin_style.css">
  <style>
    body{font-family:Arial;padding:20px;background:#f7f7f7}
    .top{display:flex;justify-content:space-between;align-items:center}
    form{background:#fff;padding:15px;border-radius:6px;box-shadow:0 1px 6px rgba(0,0,0,.08);margin-top:15px}
    input, textarea, select {width:100%;padding:8px;margin:6px 0;border:1px solid #ddd;border-radius:4px}
    button{padding:8px 12px;background:#007bff;color:#fff;border:0;border-radius:4px;cursor:pointer}
    table{width:100%;border-collapse:collapse;margin-top:15px;background:#fff}
    th,td{padding:8px;border:1px solid #eee;text-align:left}
    img.product-thumb{width:80px;height:60px;object-fit:cover;border-radius:4px}
    .actions a{margin-right:8px}
  </style>
</head>
<body>
  <div class="top">
    <h1>Admin Panel</h1>
    <div>
      Logged in as <strong><?php echo htmlspecialchars($_SESSION['admin_username']); ?></strong>
      &nbsp; | &nbsp; <a href="logout.php">Logout</a>
    </div>
  </div>

  <h2>Add Product</h2>
  <form method="POST" action="add_product.php" enctype="multipart/form-data">
    <label>Product Name</label>
    <input type="text" name="name" required>
    <label>Description</label>
    <textarea name="description"></textarea>
    <label>Category</label>
    <input type="text" name="category">
    <label>Price</label>
    <input type="number" step="0.01" name="price" required>
    <label>Discount Price (optional)</label>
    <input type="number" step="0.01" name="discount_price">
    <label>Rating (0-5)</label>
    <input type="number" step="0.1" max="5" min="0" name="rating">
    <label>Image (jpg/png, max 2MB)</label>
    <input type="file" name="image" accept="image/*">
    <br>
    <button type="submit">Add Product</button>
  </form>

  <h2>Products</h2>
  <table>
    <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Discount</th><th>Rating</th><th>Actions</th></tr></thead>
    <tbody>
    <?php
    $res = $conn->query("SELECT * FROM products ORDER BY id DESC");
    while ($row = $res->fetch_assoc()) {
        $imgPath = "../Frontend/images/" . ($row['image'] ?: 'placeholder.png');
        echo "<tr>
            <td>{$row['id']}</td>
            <td><img class='product-thumb' src='{$imgPath}' alt=''></td>
            <td>".htmlspecialchars($row['name'])."</td>
            <td>".htmlspecialchars($row['category'])."</td>
            <td>".htmlspecialchars($row['price'])."</td>
            <td>".htmlspecialchars($row['discount_price'])."</td>
            <td>".htmlspecialchars($row['rating'])."</td>
            <td class='actions'>
                <a href='edit_product.php?id={$row['id']}'>Edit</a>
                <a href='delete_product.php?id={$row['id']}' onclick=\"return confirm('Delete this product?')\">Delete</a>
            </td>
        </tr>";
    }
    ?>
    </tbody>
  </table>
</body>
</html>
