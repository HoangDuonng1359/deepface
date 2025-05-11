create database if not exists deepface_database;
use deepface_database;

create table if not exists students
(
    id   varchar(16)  not null,
    name varchar(128) null
);

alter table students
    add primary key (id);

insert into students (id, name) values
('23023026', 'Lam Duc Anh'),
('23020001', 'Nguyen Van A');