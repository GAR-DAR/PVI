<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentsController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;


use App\Models\Students;
use App\Models\Gender;
use App\Models\Status;
use App\Models\Role;

/*Route::get('/', function () {
    return view('welcome');
})->name('home');*/


Route::get('/', function () {
    $loginName = Session::get('login_name');
    $csrfToken = csrf_token();
    $studentId = Session::get('student_id');
    $studentName = Session::get('student_name');
    $studentLastname = Session::get('student_lastname');
    $avatarPath = Session::get('avatar_path');

    return view('welcome', compact('loginName', 'csrfToken', 'studentId', 'studentName', 'studentLastname', 'avatarPath'));
})->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);

});

Route::middleware('auth')->group(function () {
    // Add a view composer for all views to have user data
    view()->composer('*', function ($view) {
        if (Auth::check()) {
            $user = Auth::user();
            $view->with([
                'loginName' => $user->email,
                'csrfToken' => csrf_token(),
                'studentId' => $user->id,
                'studentName' => $user->first_name,
                'studentLastname' => $user->last_name,
                'avatarPath' => $user->avatar_path
            ]);
        }
    });

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    Route::get('/profile', function () {
        return view('profile');
    })->name('profile');

    Route::get('/profile/{student}', function ($student) {
        $studentData = Students::with(['gender', 'status', 'role'])->findOrFail($student);
        return view('profile', ['student' => $studentData]);
    })->name('profile.show');

    // Students routes
    Route::get('/students', [StudentsController::class, 'index'])->name('students.index');
    Route::get('/students/create', [StudentsController::class, 'create'])->name('students.create');
    Route::post('/students', [StudentsController::class, 'store'])->name('students.store');
    Route::get('/students/{student}/edit', [StudentsController::class, 'edit'])->name('students.edit');
    Route::put('/students/{student}', [StudentsController::class, 'update'])->name('students.update');
    Route::get('/students/{student}/confirm-delete', [StudentsController::class, 'confirmDelete'])->name('students.confirm-delete');
    Route::delete('/students/{student}', [StudentsController::class, 'destroy'])->name('students.destroy');

    // Tasks route
    Route::get('/tasks', function () {
        return view('tasks');
    });

    // Chats route
    Route::get('/chats', function () {
        return view('chats');
    })->name('chats');
});


