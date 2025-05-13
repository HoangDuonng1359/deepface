create database if not exists deepface_database;
use deepface_database;


create table if not exists students
(
    id   int  not null,
    name varchar(128) null
);

create table if not exists student_image
(
    image_id    int not null AUTO_INCREMENT primary key,
    student_id int not null, 
    base64_image LONGBLOB
);

create table if not exists student_course
(
    student_id int not null, 
    course_id varchar(16) not null
);

create table if not exists courses
(
    course_id varchar(16) not null,
    course_name varchar(128) null,
    teacher_name varchar(128) null
);

create table if not exists attendance
(
    attendance_id int not null, 
    course_id varchar(16) not null,
    timeLimit datetime not null
);


create table if not exists student_attendance
(
    student_id int not null,
    attendance_id int not null
);


-- tao khoa chinh cho cac bang
    
alter table students
	add constraint primary key (id); 

alter table student_course 
	add constraint primary key (student_id, course_id);
    
alter table courses
	add constraint primary key (course_id);
    
alter table attendance
	add constraint primary key (attendance_id);
    
alter table student_attendance
	add constraint primary key (student_id, attendance_id);


-- tao khoa ngoai cho cac bang
alter table student_image
	add constraint foreign key(student_id) references students(id) on delete cascade;

alter table student_course 
	add constraint foreign key(student_id) references students(id) on delete cascade;

alter table student_course
	add constraint foreign key(course_id) references courses(course_id) on delete cascade;

alter table attendance
	add constraint foreign key(course_id) references courses(course_id) on delete cascade;

alter table student_attendance 
	add constraint foreign key(student_id) references students(id) on delete cascade;

alter table student_attendance
	add constraint foreign key(attendance_id) references attendance(attendance_id) on delete cascade;
