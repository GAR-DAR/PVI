<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Testing\Fluent\Concerns\Has;

class Students extends Model
{
    use HasFactory;

    protected $table = 'students';

    protected $fillable = [
        'group_name',
        'first_name',
        'last_name',
        'gender_id',
        'birthday',
        'status_id',
        'email',
        'password',
        'last_login'
    ];

    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }
}
