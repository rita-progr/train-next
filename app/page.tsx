"use client"

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Student {
  id?: string;
  name: string;
  email: string;
  phone_number: string;
  gender: string;
}


export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState<Student>({
    name: "",
    email: "",
    phone_number: "",
    gender: "Male",
  });
  const [editId, setEditId] = useState<string | null>(null);

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone_number: "",
      gender: "Male",
    });
    setEditId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(form)

    if(editId){
      const {error} = await supabase.from("Students").update(form).eq("id", editId)
      if(error){
        toast.error(`Failed to update student ${error.message}`)
      }else{
        toast.success("Student updated successfully")
        // Refresh the students list
        fetchStudents()
        // Reset form and edit mode
        resetForm()
      }
    }else{    
      const {error} = await supabase.from("Students").insert([form]) 

      if(error){
        toast.error(`Failed to create ${error.message}`)
      }else{
        toast.success("Student created successfully")
        // Refresh the students list
        fetchStudents()
        // Reset form
        resetForm()
      }
    }
  }

  const fetchStudents = async () => {
    const {data, error} = await supabase.from("Students").select("*")

    if(error){
      toast.error(`Failed to fetch students ${error.message}`)
    }else{
      console.log(data)
      setStudents(data || [])
    }
  }

  function handleEditStudent(student: Student){
    setForm(student)
    if(student.id){
      setEditId(student.id)
    }
  }

     async function handleDeleteStudent(id: string){
     const res = await Swal.fire({
       title: 'Are you sure?',
       text: 'You will not be able to recover this file!',
       icon: 'warning',
       showCancelButton: true,
       confirmButtonColor: '#3085d6',
       cancelButtonColor: '#d33',
       confirmButtonText: 'Yes, delete it!'
     })

     if(res.isConfirmed){
       const {error} = await supabase.from("Students").delete().eq("id", id)

       if(error){
         toast.error(`Failed to delete student ${error.message}`)
       }else{
         toast.success("Student deleted successfully")
         // Refresh the students list
         fetchStudents()
         // If we were editing this student, reset the form
         if(editId === id) {
           resetForm()
         }
       }
     }
   }
  useEffect(() => {
    fetchStudents()
  }, [])
 

  return (
    <div className="container my-5">
      <Toaster />
      <h3 className="mb-4">Students Managment</h3>
        <div className="row">
            {/** Left Side */}
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Phone number</label>
                      <input type="text" className="form-control" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary flex-fill">
                        {editId ? "Update" : "Add"}
                      </button>
                      {editId && (
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={resetForm}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
        {/** Right Side */}
              <div className="col-md-8">
                <div className="table-responsive">
                  <div className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Gender</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.phone_number}</td>
                          <td>{student.gender}</td>
                          <td>
                            <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditStudent(student)}>Edit</button>
                            <button className="btn btn-danger btn-sm me-2" onClick={() => handleDeleteStudent(student?.id || "")}>Delete</button>
                          </td>
                        </tr>
                        ))}
                      </tbody>
                  </div>
                </div>
              </div>
        </div>
      
    </div>
  );
}
