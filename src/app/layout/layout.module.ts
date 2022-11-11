import { NgModule } from '@angular/core';
import { LayoutComponent } from 'app/layout/layout.component';
import { ClassicLayoutModule } from 'app/layout/classic-layout/classic.module';
import { SharedModule } from 'app/shared/shared.module';

const layoutModules = [
    // Vertical navigation
    ClassicLayoutModule
];

@NgModule({
    declarations: [
        LayoutComponent
    ],
    imports     : [
        SharedModule,
        ...layoutModules
    ],
    exports     : [
        LayoutComponent,
        ...layoutModules
    ]
})
export class LayoutModule
{
}
