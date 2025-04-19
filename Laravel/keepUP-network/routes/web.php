<?php

use App\Http\Controllers\StudentsController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StudentsController::class, 'index']);


Route::get('/students', [StudentsController::class, 'index']);
Route::post('/students', [StudentsController::class, 'store']);
Route::get('/students/{student}', [StudentsController::class, 'show']);
Route::put('/students/{student}', [StudentsController::class, 'update']);
Route::delete('/students/{student}', [StudentsController::class, 'destroy']);
Route::delete('/students/bulk-delete', [StudentsController::class, 'bulkDestroy']);


Route::get('/dashboard', function () {
    return view('dashboard');
});

Route::get('/tasks', function () {
    return view('tasks');
});

Route::get('/profile', function () {
    return view('profile');
});

Route::get('/chats', function () {
    return view('chats');
});