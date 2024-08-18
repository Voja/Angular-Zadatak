import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService, Employee } from './employee.service';
import { Chart, registerables } from 'chart.js';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';

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

    Chart.register(...registerables);
    Chart.register(ChartDataLabels);
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

      this.createPieChart();  
    });
  }

  createPieChart() {
    const ctx = document.getElementById('myPieChart') as HTMLCanvasElement;
    const totalHours = this.employees.map((employee) => employee.totalTimeWorked);
    const names = this.employees.map((employee) => employee.name);
  
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: names,
        datasets: [
          {
            label: 'Total Time Worked',
            data: totalHours,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0'
            ],
            hoverOffset: 4
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom', 
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                const data = tooltipItem.dataset.data as number[];
                const total = data.reduce((acc, val) => typeof val === 'number' ? acc! + val : acc!, 0); 
                const currentValue = data[tooltipItem.dataIndex];
                const percentage = ((currentValue / total) * 100).toFixed(2);
                return `${tooltipItem.label}: ${percentage}% (${currentValue} hrs)`;
              },
            },
          },
          datalabels: {
            formatter: (value, context) => {
              const data = context.chart.data.datasets[0].data;
              
            
              const total = data.reduce((acc: number, val) => {
               
                if (typeof val === 'number') {
                  return acc + val;
                }
                return acc;
              }, 0);
              
              const percentage = ((value / total) * 100).toFixed(2);
              return `${percentage}%`;
            }
            ,
            color: '#fff',
            font: {
              weight: 'bold',
            },
          },
        },
      },
    });
  }
  
}


