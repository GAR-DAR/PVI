<?php

namespace App\Http\Controllers;

use App\Models\Gender;
use App\Models\Status;
use App\Models\Students;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

use League\Flysystem\Filesystem;
use League\Flysystem\Ftp\FtpAdapter;
use League\Flysystem\Ftp\FtpConnectionOptions;
use Illuminate\Support\Facades\Storage;

use Illuminate\Support\Facades\Log;

class StudentsController extends Controller
{
    public function index()
    {
        $students = Students::with(['gender', 'status'])->paginate(9);

        $genders = Gender::all();
        $statuses = Status::all();

        return view('students', [
            'students' => $students,
            'genders' => $genders,
            'statuses' => $statuses
        ]);
    }

    public function create()
    {
        $genders = Gender::all();
        $statuses = Status::all();

        return view('students.create', [
            'genders' => $genders,
            'statuses' => $statuses
        ]);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before_or_equal:today',
            'email' => 'required|email|unique:students,email',
            'password' => 'required|string|min:6',
            'status_id' => 'required|exists:statuses,id',
            'profile_photo' => 'nullable|image|mimes:jpeg,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return redirect()->route('students.create')
                ->withErrors($validator)
                ->withInput($request->except('password'));
        }

        $existingStudent = Students::where('first_name', $request->first_name)
            ->where('last_name', $request->last_name)
            ->first();

        if ($existingStudent) {
            return redirect()->route('students.create')
                ->withErrors(['name' => 'A student with this name and surname already exists.'])
                ->withInput($request->except('password'));
        }

        

        $avatarPath = null;
        if ($request->hasFile('profile_photo') && $request->file('profile_photo')->isValid()) {
            $file = $request->file('profile_photo');
            $fileName = strtolower($request->first_name . '_' . $request->last_name . '.jpg');

            try {
                $tempPath = $file->storeAs('temp', $fileName, 'public');
                $localFilePath = Storage::disk('public')->path($tempPath);

                $options = FtpConnectionOptions::fromArray([
                    'host' => 'ftp.byethost9.com',
                    'username' => 'b9_38843962',
                    'password' => 'keepUp',
                    'port' => 21,
                    'passive' => true,
                    'timeout' => 30,
                ]);

                $adapter = new FtpAdapter($options);
                $filesystem = new Filesystem($adapter);

                $remotePath = '/htdocs/students/photos/';

                try {
                    if (!$filesystem->directoryExists('/htdocs/students/photos')) {
                        $filesystem->createDirectory('/htdocs/students/photos');
                    }
                } catch (\Exception $e) {
                    // logs hahaha

                }

                $stream = fopen($localFilePath, 'r');
                $filesystem->writeStream($remotePath . $fileName, $stream);
                if (is_resource($stream)) {
                    fclose($stream);
                }

                $avatarPath = 'http://keepup.byethost9.com/students/photos/' . $fileName;

                Storage::disk('public')->delete($tempPath);
            } catch (\Exception $e) {
                Log::error('FTP upload error: ' . $e->getMessage());
            }
        }

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
            'role_id' => 1, 
        ]);

        return redirect()->route('students.index')
            ->with('success', 'Student created successfully.');
    }


public function update(Request $request, Students $student)
    {
        $validator = Validator::make($request->all(), [
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before_or_equal:today',
            'email' => 'required|email|unique:students,email,' . $student->id,
            'password' => 'nullable|string|min:6',
            'status_id' => 'required|exists:statuses,id',
            'profile_photo' => 'nullable|image|mimes:jpeg,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return redirect()->route('students.edit', $student->id)
                ->withErrors($validator)
                ->withInput($request->except('password'));
        }

        $existingStudent = Students::where('first_name', $request->first_name)
            ->where('last_name', $request->last_name)
            ->where('id', '!=', $student->id)
            ->first();

        if ($existingStudent) {
            return redirect()->route('students.edit', $student->id)
                ->withErrors(['name' => 'Another student with this name and surname already exists. '])
                ->withInput($request->except('password'));
        }

        /*if ($existingStudent) {
            return redirect()->route('students.create')
                ->withErrors(['name' => 'A student with this name and surname already exists. UPDATE the name.'])
                ->withInput($request->except('password'));
        }*/

        if ($request->hasFile('profile_photo') && $request->file('profile_photo')->isValid()) {
            $file = $request->file('profile_photo');
            $baseFileName = strtolower($request->first_name . '_' . $request->last_name);

            $fileName = $baseFileName . '_' . time() . '.jpg';

            try {
                $tempPath = $file->storeAs('temp', $fileName, 'public');
                $localFilePath = Storage::disk('public')->path($tempPath);

                $options = FtpConnectionOptions::fromArray([
                    'host' => 'ftp.byethost9.com',
                    'username' => 'b9_38843962',
                    'password' => 'keepUp',
                    'port' => 21,
                    'passive' => true,
                    'timeout' => 30,
                ]);

                $adapter = new FtpAdapter($options);
                $filesystem = new Filesystem($adapter);

                $remotePath = '/htdocs/students/photos/';

                try {
                    if (!$filesystem->directoryExists('/htdocs/students/photos')) {
                        $filesystem->createDirectory('/htdocs/students/photos');
                    }
                } catch (\Exception $e) {
                    //logs hahaha
                }

                $stream = fopen($localFilePath, 'r');
                $filesystem->writeStream($remotePath . $fileName, $stream);
                if (is_resource($stream)) {
                    fclose($stream);
                }

                $student->avatar_path = 'http://keepup.byethost9.com/students/photos/' . $fileName;

                Storage::disk('public')->delete($tempPath);
            } catch (\Exception $e) {
                Log::error('FTP upload error: ' . $e->getMessage());
            }
        }

        $student->group_name = $request->group;
        $student->first_name = $request->first_name;
        $student->last_name = $request->last_name;
        $student->gender_id = $request->gender_id;
        $student->birthday = $request->birthday;
        $student->email = $request->email;
        $student->status_id = $request->status_id;

        if ($request->filled('password')) {
            $student->password = bcrypt($request->password);
        }

        $student->save();

        return redirect()->route('students.index')
            ->with('success', 'Student updated successfully.');
    }

    public function show(Students $student)
    {
        $student->load(['gender', 'status']);

        return response()->json([
            'student' => $student
        ]);
    }

    public function confirmDelete(Students $student)
    {
        return view('students.destroy', compact('student'));
    }

    public function destroy(Students $student)
    {
        $name = $student->first_name . ' ' . $student->last_name;
        $student->delete();

        return redirect()->route('students.index')
            ->with('success', "Student {$name} has been deleted successfully");
    }

    public function edit(Students $student)
    {
        $genders = Gender::all();
        $statuses = Status::all();

        return view('students.edit', compact('student', 'genders', 'statuses'));
    }


    public function editOwnProfile()
    {
        $student = Students::where('email', Auth::user()->email)->first();

        if (!$student) {
            return redirect()->route('profile.complete');
        }

        $genders = Gender::all();
        $statuses = Status::all();

        return view('students.edit', compact('student', 'genders', 'statuses'));
    }

    public function updateOwnProfile(Request $request)
    {
        $student = Students::where('email', Auth::user()->email)->first();

        $user = User::where('email', Auth::user()->email)->first();

        if (!$student) {
            return redirect()->route('profile.complete');
        }

        $validator = Validator::make($request->all(), [
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before_or_equal:today',
            'password' => 'nullable|min:6',
        ]);

        if ($validator->fails()) {
            return redirect()->route('profile.edit')
                ->withErrors($validator)
                ->withInput();
        }

        $student->update([
            'group_name' => $request->group,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'gender_id' => $request->gender_id,
            'birthday' => $request->birthday,
        ]);

        if ($request->filled('password')) {
            $student->update([
                'password' => bcrypt($request->password)
            ]);

            
            if ($user) {
                $user->password = bcrypt($request->password);
                $user->save();
            }
        }

        if ($user) {
            $user->name = $request->first_name . ' ' . $request->last_name;
            $user->save();
        }

        return redirect()->route('profile')
            ->with('success', 'Your profile has been updated successfully');
    }
}
