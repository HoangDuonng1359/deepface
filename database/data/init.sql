create database if not exists deepface_database;
use deepface_database;


create table if not exists students
(
    id   varchar(16)  not null,
    name varchar(128) null
);

create table if not exists student_image
(
    image_id    varchar(16) not null,
    student_id varchar(16) not null, 
    base64_image LONGBLOB
);

create table if not exists student_course
(
    student_id varchar(16) not null, 
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
    attendance_id varchar(16) not null, 
    course_id varchar(16) not null,
    timeLimit datetime not null
);


create table if not exists student_attendance
(
    student_id varchar(16) not null,
    attendance_id varchar(16) not null
);


-- tao khoa chinh cho cac bang
alter table student_image
	add constraint primary key (image_id);
    
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
	add constraint foreign key(student_id) references students(id);

alter table student_course 
	add constraint foreign key(student_id) references students(id);

alter table student_course
	add constraint foreign key(course_id) references courses(course_id);
    
alter table attendance
	add constraint foreign key(course_id) references courses(course_id);
    
alter table student_attendance 
	add constraint foreign key(student_id) references students(id);
alter table student_attendance
	add constraint foreign key(attendance_id) references attendance(attendance_id)



insert into students (id, name) values
('23023026', 'Lam Duc Anh'),
('23020001', 'Nguyen Van A');
