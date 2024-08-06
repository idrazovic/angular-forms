import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, of } from 'rxjs';

type Role = 'student' | 'teacher' | 'employee' | 'founder' | 'other';

function mustContainQuestionMark(control: AbstractControl) {
    if (control.value?.includes('?')) {
        return null;
    }
    return { doesNotContainQuestionMark: true };
}

function emailIsUnique(control: AbstractControl) {
    if (control.value !== 'test@test.com') {
        return of(null);
    }
    return of({ isNotUnique: true });
}

function passwordsMatch(control: AbstractControl) {
    if (control.get('password')?.value === control.get('confirmPassword')?.value) {
        return null;
    }
    return { passwordsDontMatch: true };
}

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './signup.component.html',
    styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
    destroyRef = inject(DestroyRef);
    form = new FormGroup({
        email: new FormControl('', {
            validators: [Validators.required, Validators.email],
            asyncValidators: [emailIsUnique],
        }),
        passwords: new FormGroup({
            password: new FormControl('', {
                validators: [Validators.required, Validators.minLength(6), mustContainQuestionMark],
            }),
            confirmPassword: new FormControl('', {
                validators: [Validators.required, Validators.minLength(6)],
            }),
        }, {
            validators: [passwordsMatch],
        }),
        firstName: new FormControl(''),
        lastName: new FormControl(''),
        address: new FormGroup({
            street: new FormControl(''),
            number: new FormControl(''),
            postalCode: new FormControl(''),
            city: new FormControl(''),
        }),
        role: new FormControl<Role>('student'),
        source: new FormArray([
            new FormControl(false),
            new FormControl(false),
            new FormControl(false),
        ]),
        agree: new FormControl(false, {
            validators: [Validators.requiredTrue]
        }),
    });

    get emailIsInvalid() {
        return this.form.controls.email.touched
            && this.form.controls.email.dirty
            && this.form.controls.email.invalid;
    }

    get passwordIsInvalid() {
        return this.form.controls.passwords.controls.password.touched
            && this.form.controls.passwords.controls.password.dirty
            && this.form.controls.passwords.controls.password.invalid;
    }

    ngOnInit(): void {
        const savedForm = localStorage.getItem('signup-form');

        if (savedForm) {
            const loadedForm = JSON.parse(savedForm);
            setTimeout(() => {
                this.form.patchValue({ email: loadedForm.email });
            });
        }

        this.form.valueChanges
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                debounceTime(500)
            )
            .subscribe((value) => {
                localStorage.setItem('signup-form', JSON.stringify(value));
            });
    }

    onSubmit() {
        console.log(this.form.value);
    }

    onReset() {
        this.form.reset();
    }
}
