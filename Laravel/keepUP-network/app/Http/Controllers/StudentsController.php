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
        $students = Students::with(['gender', 'status'])->get();

        // Also get all genders and statuses for any dropdowns you might need
        $genders = Gender::all();
        $statuses = Status::all();

        return view('students', [
            'students' => $students,
            'genders' => $genders,
            'statuses' => $statuses
        ]);
    }

    public function store(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Create a new student
        $student = new Students();
        $student->group_name = $request->group;
        $student->first_name = $request->first_name;
        $student->last_name = $request->last_name;
        $student->gender_id = $request->gender_id;
        $student->birthday = $request->birthday;
        $student->status_id = 2; // Default to offline (assuming 2 is offline)
        $student->save();

        // Load the related models
        $student->load(['gender', 'status']);

        return response()->json([
            'message' => 'Student created successfully',
            'student' => $student
        ], 201);
    }

    public function show(Students $student)
    {
        // Load the related models
        $student->load(['gender', 'status']);

        return response()->json([
            'student' => $student
        ]);
    }

    public function update(Request $request, Students $student)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'group' => 'required|string|max:10',
            'first_name' => 'required|string|min:2|max:50',
            'last_name' => 'required|string|min:2|max:50',
            'gender_id' => 'required|exists:genders,id',
            'birthday' => 'required|date|before:today',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update the student
        $student->group_name = $request->group;
        $student->first_name = $request->first_name;
        $student->last_name = $request->last_name;
        $student->gender_id = $request->gender_id;
        $student->birthday = $request->birthday;
        $student->save();

        // Load the related models
        $student->load(['gender', 'status']);

        return response()->json([
            'message' => 'Student updated successfully',
            'student' => $student
        ]);
    }

    public function destroy(Students $student)
    {
        // Delete the student
        $student->delete();

        return response()->json([
            'message' => 'Student deleted successfully'
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'required|exists:students,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Delete the students
        Students::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => count($request->ids) . ' students deleted successfully'
        ]);
    }
}
