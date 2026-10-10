<?php
$dsn = "pgsql:host=3.18.239.121;port=5432;dbname=neondb;sslmode=require;options='endpoint=ep-summer-rice-b5vr065y'";
$pdo = new PDO($dsn, 'neondb_owner', 'npg_BPcGpoXZ02LN');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec("DROP TABLE IF EXISTS users CASCADE");
echo "users table dropped.\n";
