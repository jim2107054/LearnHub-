<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

config([
    'database.connections.pgsql.host' => '3.18.239.121',
    'database.connections.pgsql.database' => "neondb';options='endpoint=ep-summer-rice-b5vr065y-pooler",
    'database.connections.pgsql.username' => 'neondb_owner',
    'database.connections.pgsql.password' => 'npg_BPcGpoXZ02LN',
    'database.connections.pgsql.sslmode' => 'require',
]);

try {
    $res = Illuminate\Support\Facades\DB::connection('pgsql')->select('SELECT version()');
    echo "LARAVEL DB FACADE CONNECTED: " . $res[0]->version . PHP_EOL;
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
}
