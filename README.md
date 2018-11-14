When designing DB schema, we want it to be free of
* Update Anomalies
* Insertion Anomalies
* Deletion Anomalies

To do this, we split our schema so that the original information can be retrieved by **join** operation.

### 3NF/BCNF GENERATOR
The **BCNF generator** automates this procedure in your browser and shows the intermediate steps.
Let's use an example. Suppose we have the following table.

| StudentNo | StudentName | Degree | GPA  | CourseNo | CourseName  | Grade   | Credits |
|-----------|-------------|--------|------|----------|-------------|---------|---------|
| 12345     | Cooper      | BCS    | 10.9 | 100      | Intro to CS | 69      | 3       |
| 12345     | Cooper      | BCS    | 10.9 | 102      | C Course    | 78      | 3       |
| 12355     | Smith       | BCS    | 11.9 | 100      | Intro to CS | 85      | 3       |
| 12355     | Smith       | BCS    | 11.9 | 102      | C Course    | 86      | 3       |
| 12355     | Smith       | BCS    | 11.9 | 203      | Comp. Org.  | 72      | 3       |
| 12377     | Miles       | BCS    | 10.1 | 100      | Intro to CS | 57      | 3       |

We have functional dependencies
>1) StudentNo -> StudentName, Degree, GPA
>2) CourseNo -> CourseName, Credits
>3) StudentNo, CourseNo -> Grade

This is because for each LHS value, you can only have 1 RHS value.
To use the *3NF/BCNF generator*, we need to give the program the number of attributes and FDs.
There are 8 attributes and our FD needs to be in the format specified by the program.

