<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BelongsToClinic
{
    /**
     * Boot the trait to apply the tenant clinic scoping.
     */
    protected static function bootBelongsToClinic(): void
    {
        // Automatically assign clinic_id when creating a new record
        static::creating(function (Model $model) {
            if (auth()->check() && empty($model->clinic_id)) {
                $user = auth()->user();
                if (isset($user->clinic_id)) {
                    $model->clinic_id = $user->clinic_id;
                }
            }
        });

        // Automatically filter queries by the authenticated user's clinic_id
        static::addGlobalScope('clinic_scope', function (Builder $builder) {
            if (auth()->check()) {
                $user = auth()->user();
                
                // If the user is a superadmin, bypass the clinic scoping so they can manage all clinics
                if (isset($user->is_superadmin) && $user->is_superadmin) {
                    return;
                }
                
                if (isset($user->clinic_id)) {
                    $builder->where($builder->getModel()->getTable() . '.clinic_id', $user->clinic_id);
                }
            }
        });
    }
}
