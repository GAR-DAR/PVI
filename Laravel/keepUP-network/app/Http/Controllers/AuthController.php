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

use Illuminate\Container\Attributes\Log;

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

            $student = Students::where('email', Auth::user()->email)->first();

            if (!$student) {
                return redirect()->route('profile.complete');
            }

            $student->status_id = 1; //online
            $student->save();

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
        $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email|unique:students,email',
            'password' => 'required|string|min:8|confirmed',
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before_or_equal:today',
            'status_id' => 'required|exists:statuses,id',
            'profile_photo' => 'nullable|image|mimes:jpeg,jpg|max:2048',
        ]);

        $existingStudent = Students::where('first_name', $request->first_name)
            ->where('last_name', $request->last_name)
            ->first();

        if ($existingStudent) {
            return back()->withErrors(['name' => 'A student with this name and surname already exists.'])
                ->withInput($request->except('password'));
        }

        $avatarPath = null;
        if ($request->hasFile('profile_photo') && $request->file('profile_photo')->isValid()) {
            $file = $request->file('profile_photo');
            $fileName = strtolower($request->first_name . '_' . $request->last_name . '.jpg');

            $ftpHost = 'ftp.byethost9.com';
            $ftpUsername = 'b9_38843962';
            $ftpPassword = 'keepUp'; 
            $ftpPath = '/htdocs/students/photos/';

            try {
                $ftpConnection = ftp_connect($ftpHost);

                if ($ftpConnection) {
                    $loggedIn = ftp_login($ftpConnection, $ftpUsername, $ftpPassword);

                    if ($loggedIn) {
                        ftp_pasv($ftpConnection, true);

                        try {
                            if (!@ftp_chdir($ftpConnection, '/htdocs/students/photos/')) {
                                if (!@ftp_chdir($ftpConnection, '/htdocs/students/')) {
                                    ftp_mkdir($ftpConnection, '/htdocs/students');
                                }
                                ftp_chdir($ftpConnection, '/htdocs/students/');
                                ftp_mkdir($ftpConnection, 'photos');
                            }
                        } catch (\Exception $e) {
                            //logs hahahaha help
                        }

                        $tempFile = tempnam(sys_get_temp_dir(), 'ftp');
                        file_put_contents($tempFile, file_get_contents($file->getRealPath()));

                        if (ftp_put($ftpConnection, $ftpPath . $fileName, $tempFile, FTP_BINARY)) {
                            $avatarPath = 'http://keepup.byethost9.com/students/photos/' . $fileName;
                        }

                        unlink($tempFile);
                        ftp_close($ftpConnection);
                    }
                }
            } catch (\Exception $e) {
                //logs hahahaha help

            }
        }

        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $student = Students::create([
            'group_name' => $request->group,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'gender_id' => $request->gender_id,
            'birthday' => $request->birthday,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'status_id' => $request->status_id,
            'avatar_path' => $avatarPath, 
            'role_id' => 2, 
        ]);

        return redirect()->route('login')
            ->with('success', 'Account created successfully! You can now log in.');
    }

    public function logout(Request $request)
    {
        // offline
        if (Auth::check()) {
            $student = Students::where('email', Auth::user()->email)->first();
            if ($student) {
                $student->status_id = 2;
                $student->save();
            }
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }


  
}
