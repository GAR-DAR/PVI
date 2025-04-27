<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentsController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', function () {
    return view('welcome');
})->name('home');

// Auth routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Protected routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    // Profile route
    Route::get('/profile', function () {
        return view('profile');
    })->name('profile');

    // Student routes
    Route::get('/students', [StudentsController::class, 'index'])->name('students.index');
    Route::get('/students/create', [StudentsController::class, 'create'])->name('students.create');
    Route::post('/students', [StudentsController::class, 'store'])->name('students.store');
    Route::get('/students/{student}/edit', [StudentsController::class, 'edit'])->name('students.edit');
    Route::put('/students/{student}', [StudentsController::class, 'update'])->name('students.update');
    Route::get('/students/{student}/confirm-delete', [StudentsController::class, 'confirmDelete'])->name('students.confirm-delete');
    Route::delete('/students/{student}', [StudentsController::class, 'destroy'])->name('students.destroy');

    Route::get('/tasks', function () {
        return view('tasks');
    });

    Route::get('/chats', function () {
        return view('chats');
    });
});
