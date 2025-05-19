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