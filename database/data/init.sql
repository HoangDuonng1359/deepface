create database if not exists deepface_database;
use deepface_database;

create table if not exists attendances
(
    attendance_id int auto_increment
        primary key,
    course_id     varchar(16) not null,
    start_time    datetime    null,
    end_time      datetime    null,
    late_time     datetime    null
);

create table if not exists courses
(
    course_id    varchar(16)  not null,
    course_name  varchar(256) not null,
    teacher_name varchar(256) not null
);

alter table courses
    add primary key (course_id);

alter table attendances
    add constraint attendances_courses_course_id_fk
        foreign key (course_id) references courses (course_id);

create table if not exists student_attendance
(
    student_id    varchar(16)              not null,
    attendance_id int                      not null,
    time_in       datetime default (now()) not null,
    status        varchar(16)              not null,
    emotion       varchar(16)              not null
);

alter table student_attendance
    add primary key (attendance_id, student_id);

alter table student_attendance
    add constraint student_attendance_attendances_attendance_id_fk
        foreign key (attendance_id) references attendances (attendance_id);

create table if not exists student_course
(
    student_id varchar(16) not null,
    course_id  varchar(16) not null
);

alter table student_course
    add primary key (student_id, course_id);

alter table student_course
    add constraint student_course_courses_course_id_fk
        foreign key (course_id) references courses (course_id);

create table if not exists student_image
(
    image_id   int auto_increment
        primary key,
    student_id varchar(16) not null,
    image      longtext    not null
);

create table if not exists students
(
    student_id   varchar(16)             not null,
    student_name varchar(256)            not null,
    cohort       varchar(256) default '' null
);

INSERT INTO deepface_database.attendances (attendance_id, course_id, start_time, end_time, late_time) 
VALUES (1, 'INT2208-1', '2025-05-19 22:30:44', '2025-05-19 22:36:06', '2025-05-19 22:35:00');

INSERT INTO deepface_database.courses (course_id, course_name, teacher_name) 
VALUES ('INT2208-1', 'Công nghệ phần mềm', 'Phạm Ngọc Hùng');

insert into deepface_database.student_attendance (student_id, attendance_id, time_in, status, emotion)
values  ('23020001', 1, '2025-05-19 15:35:59', 'late', 'sad'),
        ('23020326', 1, '2025-05-19 15:32:32', 'early', 'happy');

insert into deepface_database.student_course (student_id, course_id)
values  ('23020001', 'INT2208-1'),
        ('23020002', 'INT2208-1'),
        ('23020326', 'INT2208-1');

insert into deepface_database.students (student_id, student_name, cohort)
values  ('23020001', 'Nguyễn Hải An', 'K68-IT1'),
        ('23020002', 'Nguyễn Văn An', 'K68-IT2'),
        ('23020326', 'Lâm Đức Anh', 'K68-AI2');


alter table students
    add primary key (student_id);

alter table student_attendance
    add constraint student_attendance_students_student_id_fk
        foreign key (student_id) references students (student_id);

alter table student_course
    add constraint student_course_students_student_id_fk
        foreign key (student_id) references students (student_id);

alter table student_image
    add constraint student_image_students_student_id_fk
        foreign key (student_id) references students (student_id);