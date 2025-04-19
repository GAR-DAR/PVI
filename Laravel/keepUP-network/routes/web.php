<?php

use App\Http\Controllers\StudentsController;
use Illuminate\Support\Facades\Route;

Route::get('/', [StudentsController::class, 'index']);


Route::get('/students', [StudentsController::class, 'index'])->name('students.index');

Route::get('/students/create', [StudentsController::class, 'create'])->name('students.create');

Route::post('/students', [StudentsController::class, 'store'])->name('students.store');

Route::get('/students/{student}/edit', [StudentsController::class, 'edit'])->name('students.edit');
Route::put('/students/{student}', [StudentsController::class, 'update'])->name('students.update');
Route::delete('/students/{student}', [StudentsController::class, 'destroy'])->name('students.destroy');



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