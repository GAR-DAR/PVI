<?php

namespace App\Http\Controllers;

use App\Models\Gender;
use App\Models\Status;
use App\Models\Students;
use Illuminate\Http\Request;

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
}
