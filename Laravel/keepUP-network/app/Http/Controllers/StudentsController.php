<?php

namespace App\Http\Controllers;

use App\Models\Gender;
use App\Models\Status;
use App\Models\Students;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentsController extends Controller
{
    public function index()
    {
        // Use eager loading with the "with" method to load related models
        $students = Students::with(['gender', 'status'])->paginate(9);

        // Also get all genders and statuses for any dropdowns you might need
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
        // Validate form data
        $validator = Validator::make($request->all(), [
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before_or_equal:today',
            'email' => 'required|email|unique:students,email',
            'password' => 'required|string|min:6',
            'status_id' => 'required|exists:statuses,id',
        ]);

        // If validation fails, redirect back with errors and input
        if ($validator->fails()) {
            return redirect()->route('students.create')
                ->withErrors($validator)
                ->withInput($request->except('password'));
        }

        // Create a new student with validated data
        $student = Students::create([
            'group_name' => $request->group, // Changed from 'group' to 'group_name'
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'gender_id' => $request->gender_id,
            'birthday' => $request->birthday,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'status_id' => $request->status_id,
        ]);

        // Redirect to students index with success message
        return redirect()->route('students.index')
            ->with('success', 'Student created successfully.');
    }

    public function show(Students $student)
    {
        // Load the related models
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
        // Get genders and statuses for the form dropdowns
        $genders = Gender::all();
        $statuses = Status::all();

        return view('students.edit', compact('student', 'genders', 'statuses'));
    }

    
    public function update(Request $request, Students $student)
    {
        // Validate form data
        $validator = Validator::make($request->all(), [
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before_or_equal:today',
            'email' => 'required|email|unique:students,email,' . $student->id,
            'status_id' => 'required|exists:statuses,id',
            'password' => 'nullable|min:6',
        ]);

        if ($validator->fails()) {
            return redirect()->route('students.edit', $student)
                ->withErrors($validator)
                ->withInput();
        }

        // Update student data
        $student->update([
            'group_name' => $request->group,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'gender_id' => $request->gender_id,
            'birthday' => $request->birthday,
            'email' => $request->email,
            'status_id' => $request->status_id,
        ]);

        // Only update password if provided
        if ($request->filled('password')) {
            $student->update([
                'password' => bcrypt($request->password)
            ]);
        }

        return redirect()->route('students.index')
            ->with('success', 'Student updated successfully');
    }

}
