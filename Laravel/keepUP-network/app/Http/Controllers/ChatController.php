<?php

namespace App\Http\Controllers;

use App\Models\Students;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index()
    {
        $currentUser = Students::where('email', Auth::user()->email)->first();
        $allUsers = Students::select('id', 'first_name', 'last_name', 'email', 'avatar_path', 'status_id')
                            ->get();
        
        return view('chats', [
            'currentUser' => $currentUser,
            'allUsers' => $allUsers
        ]);
    }
}