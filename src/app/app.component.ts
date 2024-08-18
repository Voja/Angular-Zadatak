import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from './employee.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Zadatak Angular';
  employees: { name: string; totalTimeWorked: number; highlight: boolean }[] = [];

  constructor(private employeeService: EmployeeService) {

   
  }

  ngOnInit() {
    this.employeeService.getEmployeeData().subscribe((data) => {
      const employeeMap = new Map<string, number>();

      data
        .filter(entry => entry.EmployeeName)
        .forEach(entry => {
          const duration = new Date(entry.EndTimeUtc).getTime() - new Date(entry.StarTimeUtc).getTime();
          if (employeeMap.has(entry.EmployeeName)) {
            employeeMap.set(entry.EmployeeName, employeeMap.get(entry.EmployeeName)! + duration);
          } else {
            employeeMap.set(entry.EmployeeName, duration);
          }
        });

      this.employees = Array.from(employeeMap, ([name, totalTimeWorked]) => ({
        name,
        totalTimeWorked: Math.round(totalTimeWorked / (1000 * 60 * 60)),  
        highlight: (totalTimeWorked / (1000 * 60 * 60)) < 100  
      })).sort((a, b) => b.totalTimeWorked - a.totalTimeWorked);

      console.log('Total Employees:', this.employees.length);  
      console.log(this.employees);  

     
    });
  }


}
