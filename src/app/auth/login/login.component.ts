import { afterNextRender, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    private form = viewChild.required<NgForm>('form');
    private destroyRef = inject(DestroyRef);

    constructor() {
        afterNextRender(() => {
            const savedForm = window.localStorage.getItem('login-form');

            if (savedForm) {
                const savedEmail = JSON.parse(savedForm).email;
                setTimeout(() => {
                    this.form().controls['email'].setValue(savedEmail);
                });
            }

            const subscription = this.form().valueChanges?.pipe(
                debounceTime(500)
            )
                .subscribe((value) => {
                    window.localStorage.setItem(
                        'login-form',
                        JSON.stringify({ email: value.email })
                    );
                });

            this.destroyRef.onDestroy(() => {
                subscription?.unsubscribe();
            });
        });
    }

    onSubmit(formData: NgForm) {
        if (!formData.form.valid) {
            return;
        }

        console.log(formData.form.value);

        formData.form.reset();
    }
}
