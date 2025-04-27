<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Students;
use App\Models\Gender;
use App\Models\Status;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

use App\Http\Controllers\StudentsController;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Check if the user has completed their profile
            $student = Students::where('email', Auth::user()->email)->first();

            // If no student record or incomplete profile, redirect to profile completion
            if (!$student) {
                return redirect()->route('profile.complete');
            }

            return redirect()->intended('/students')
                ->with('success', 'Welcome back!');
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    public function showRegister()
    {
        $genders = Gender::all();
        $statuses = Status::all();

        return view('auth.register', [
            'genders' => $genders,
            'statuses' => $statuses
        ]);
    }

    public function register(Request $request)
    {
        // Validate all data at once
        $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email|unique:students,email',
            'password' => 'required|string|min:8|confirmed',
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before_or_equal:today',
            'status_id' => 'required|exists:statuses,id',
        ]);

        // Create new user in the users table
        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Also create a student record with the same data
        $student = Students::create([
            'group_name' => $request->group,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'gender_id' => $request->gender_id,
            'birthday' => $request->birthday,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'status_id' => $request->status_id,
        ]);

        Auth::login($user);

        return redirect()->route('students.index')
            ->with('success', 'Account created successfully!');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

  
}
