let employees = [
    {
        _id : 'aa001',
        name : 'Rajan'
    },
    {
        _id : 'aa002',
        name : 'Mahesh'
    },
    {
        _id : 'aa003',
        name : 'john'
    }
];
let employee_id = 'aa001';
let removableIndex = employees.map(employee => employee._id).indexOf(employee_id);
console.log(employees);
employees.splice(-1 , 1);
console.log(employees);