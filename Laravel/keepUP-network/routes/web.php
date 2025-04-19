<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentsController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StudentsController::class, 'index']);

Route::get('/students', [StudentsController::class, 'index']);

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