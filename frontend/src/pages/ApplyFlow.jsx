
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';

export default function ApplyFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [jobTitle, setJobTitle] = useState('Loading...');

 
 
  const [bio, setBio] = useState({
    firstName: '', lastName: '', email: '', gender: '', mobile: '', dob: '', 
    currentLocation: '', currentCompany: '', noticePeriod: '', currentAddress: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [educations, setEducations] = useState([{ 
    educationLevel: '', degree: '', specialization: '', institution: '', year: '', grade: '' 
  }]);

  const [isFresher, setIsFresher] = useState(false);
  const [experiences, setExperiences] = useState([{ 
    company: '', designation: '', startDate: '', endDate: '', currentlyWorking: false, responsibilities: '' 
  }]);

  const [resume, setResume] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [consentAccuracy, setConsentAccuracy] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch job title for the header
  useEffect(() => {
    axios.get(`http://localhost:8000/api/public/jobs/${id}/`)
      .then(res => setJobTitle(res.data.title))
      .catch(err => console.error("Could not fetch job title", err));
  }, [id]);

  const handleFileUpload = (e, setFileState, maxSizeMB) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File size exceeds the ${maxSizeMB}MB limit.`);
        e.target.value = null; 
      } else {
        setFileState(file);
      }
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !consentAccuracy || !consentPrivacy) {
      toast.warn("Please attach your resume and accept the consents.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('bioData', JSON.stringify(bio));
    formData.append('education', JSON.stringify(educations));
    formData.append('experience', JSON.stringify(isFresher ? [] : experiences));
    formData.append('resume', resume);
    if (profilePhoto) formData.append('profilePhoto', profilePhoto);
    formData.append('coverNote', coverNote);

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`http://localhost:8000/api/jobs/${id}/apply/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      
      Swal.fire({
        title: 'Application Submitted!',
        html: `Your application has been received successfully.<br/><br/><b>Application ID: ${res.data.application_id}</b>`,
        icon: 'success',
        confirmButtonColor: '#2C5EAD',
        confirmButtonText: 'Go to Dashboard'
      }).then(() => {
        navigate('/candidate-dashboard');
      });

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Submission failed. Please check your data.");
      setIsSubmitting(false);
    }
  };

  // Reusable Tailwind Styles
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4BB8FA] focus:border-transparent transition shadow-sm outline-none bg-white text-gray-800";
  const labelClass = "block text-sm font-bold text-gray-700 mb-1.5";
  const sectionTitleClass = "text-2xl font-extrabold text-[#2C5EAD] mb-6 border-b-2 border-[#C4E2F5] pb-2";

  const stepNames = ['Bio-Data', 'Education', 'Work Experience', 'Resume & Submit'];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-[#2C5EAD]">
        
        {/* Header & Custom Step Indicator */}
        <div className="bg-white px-8 py-8 border-b border-gray-200">
          <h1 className="text-2xl font-extrabold text-gray-800 mb-8">Apply: {jobTitle}</h1>
          
          <div className="flex items-center w-full overflow-x-auto pb-4 sm:pb-0">
            {stepNames.map((name, index) => {
              const stepNum = index + 1;
              const isCompleted = stepNum < step;
              const isActive = stepNum === step;

              return (
                <React.Fragment key={name}>
                  <div className="flex items-center shrink-0">
                    {/* Circle Indicator */}
                    {isCompleted ? (
                      <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    ) : isActive ? (
                      <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-blue-500 text-blue-600 rounded-full font-bold">
                        {stepNum}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-300 text-gray-400 rounded-full font-bold">
                        {stepNum}
                      </div>
                    )}
                    
                    {/* Step Name */}
                    <span className={`ml-2 text-sm font-bold ${isCompleted ? 'text-gray-500' : isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                      {name}
                    </span>
                  </div>

                  {/* Connector Line (except for the last item) */}
                  {index < stepNames.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 transition duration-300 min-w-[20px] ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="p-8 sm:p-10">
          {/* STEP 1: BIO-DATA */}
          
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div><label className={labelClass}>First Name *</label><input required value={bio.firstName} onChange={e => setBio({...bio, firstName: e.target.value})} className={inputClass} placeholder="John"/></div>
                <div><label className={labelClass}>Last Name *</label><input required value={bio.lastName} onChange={e => setBio({...bio, lastName: e.target.value})} className={inputClass} placeholder="Doe"/></div>
                
                {/* NEW EMAIL FIELD */}
                <div className="sm:col-span-2">
                  <label className={labelClass}>Email Address *</label>
                  <input required type="email" value={bio.email} onChange={e => setBio({...bio, email: e.target.value})} className={inputClass} placeholder="john.doe@example.com"/>
                </div>
                
                <div>
                  <label className={labelClass}>Gender (Optional)</label>
                  <select value={bio.gender} onChange={e => setBio({...bio, gender: e.target.value})} className={inputClass}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div><label className={labelClass}>Mobile Number *</label><input required type="tel" value={bio.mobile} onChange={e => setBio({...bio, mobile: e.target.value})} className={inputClass} placeholder="+1 234 567 890"/></div>
                
                <div><label className={labelClass}>Date of Birth (Optional)</label><input type="date" value={bio.dob} onChange={e => setBio({...bio, dob: e.target.value})} className={inputClass} /></div>
                <div><label className={labelClass}>Current Location *</label><input required value={bio.currentLocation} onChange={e => setBio({...bio, currentLocation: e.target.value})} className={inputClass} placeholder="City, State/Country" /></div>
                
                <div><label className={labelClass}>Current Company (Optional)</label><input value={bio.currentCompany} onChange={e => setBio({...bio, currentCompany: e.target.value})} className={inputClass} placeholder="e.g. Acme Corp" /></div>
                <div>
                  <label className={labelClass}>Notice Period (Optional)</label>
                  <select value={bio.noticePeriod} onChange={e => setBio({...bio, noticePeriod: e.target.value})} className={inputClass}>
                    <option value="">Select Notice Period</option>
                    <option value="Immediate">Immediate</option>
                    <option value="15 days">15 days</option>
                    <option value="30 days">30 days</option>
                    <option value="90+ days">90+ days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Current Address (Optional)</label>
                <textarea value={bio.currentAddress} onChange={e => setBio({...bio, currentAddress: e.target.value})} className={`${inputClass} h-24 resize-none`} placeholder="Full residential address" />
              </div>

              <div>
                <label className={labelClass}>Profile Photo (Optional, Max 2MB, JPG/PNG)</label>
                <input type="file" accept=".jpg,.jpeg,.png" onChange={e => handleFileUpload(e, setProfilePhoto, 2)} className="w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C4E2F5] file:text-[#2C5EAD] hover:file:bg-[#4BB8FA] hover:file:text-white transition cursor-pointer" />
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-[#1591DC] hover:bg-[#2C5EAD] text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300">Next: Education &rarr;</button>
              </div>
            </form>
          )}

          {/* STEP 2: EDUCATION */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-6 animate-fadeIn">
              {educations.map((edu, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative shadow-sm">
                  {educations.length > 1 && (
                    <button type="button" onClick={() => setEducations(educations.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-sm">Remove</button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Level *</label>
                      <select required value={edu.educationLevel} onChange={e => { const copy = [...educations]; copy[idx].educationLevel = e.target.value; setEducations(copy); }} className={inputClass}>
                        <option value="">Select Level</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Master's">Master's</option>
                        <option value="Doctorate">Doctorate</option>
                      </select>
                    </div>
                    <div><label className={labelClass}>Degree / Qualification *</label><input required value={edu.degree} onChange={e => { const copy = [...educations]; copy[idx].degree = e.target.value; setEducations(copy); }} className={inputClass} placeholder="e.g. BE"/></div>
                    <div><label className={labelClass}>Specialization (Optional)</label><input value={edu.specialization} onChange={e => { const copy = [...educations]; copy[idx].specialization = e.target.value; setEducations(copy); }} className={inputClass} placeholder="e.g. Artificial Intelligence"/></div>
                    <div><label className={labelClass}>Institution / University *</label><input required value={edu.institution} onChange={e => { const copy = [...educations]; copy[idx].institution = e.target.value; setEducations(copy); }} className={inputClass} placeholder="University Name"/></div>
                    <div><label className={labelClass}>Year of Passing *</label><input required maxLength="4" value={edu.year} onChange={e => { const copy = [...educations]; copy[idx].year = e.target.value; setEducations(copy); }} className={inputClass} placeholder="YYYY"/></div>
                    <div><label className={labelClass}>Grade / CGPA (Optional)</label><input value={edu.grade} onChange={e => { const copy = [...educations]; copy[idx].grade = e.target.value; setEducations(copy); }} className={inputClass} placeholder="e.g. 3.8 or 85%"/></div>
                  </div>
                </div>
              ))}
              
              <button type="button" onClick={() => setEducations([...educations, { educationLevel: '', degree: '', specialization: '', institution: '', year: '', grade: '' }])} className="text-[#1591DC] hover:text-[#2C5EAD] font-bold text-sm flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Add Another Education
              </button>
              
              <div className="pt-6 flex justify-between border-t border-gray-100">
                <button type="button" onClick={() => setStep(1)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 px-6 rounded-lg transition duration-200">&larr; Back</button>
                <button type="submit" className="bg-[#1591DC] hover:bg-[#2C5EAD] text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300">Next: Experience &rarr;</button>
              </div>
            </form>
          )}

          {/* STEP 3: EXPERIENCE */}
          {step === 3 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-6 animate-fadeIn">
              <div className="bg-[#C4E2F5] bg-opacity-30 p-4 rounded-lg border border-[#C4E2F5] mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={isFresher} onChange={e => setIsFresher(e.target.checked)} className="w-5 h-5 text-[#1591DC] rounded border-gray-300 focus:ring-[#4BB8FA] cursor-pointer"/>
                  <span className="font-bold text-[#2C5EAD]">I am a Fresher (No prior work experience)</span>
                </label>
              </div>

              {!isFresher && experiences.map((exp, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative shadow-sm">
                  {experiences.length > 1 && (
                    <button type="button" onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-sm">Remove</button>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div><label className={labelClass}>Company Name *</label><input required value={exp.company} onChange={e => { const copy = [...experiences]; copy[idx].company = e.target.value; setExperiences(copy); }} className={inputClass} placeholder="Employer Name"/></div>
                    <div><label className={labelClass}>Designation *</label><input required value={exp.designation} onChange={e => { const copy = [...experiences]; copy[idx].designation = e.target.value; setExperiences(copy); }} className={inputClass} placeholder="Job Title"/></div>
                    <div><label className={labelClass}>Start Date *</label><input type="date" required value={exp.startDate} onChange={e => { const copy = [...experiences]; copy[idx].startDate = e.target.value; setExperiences(copy); }} className={inputClass} /></div>
                    <div><label className={labelClass}>End Date</label><input type="date" disabled={exp.currentlyWorking} value={exp.endDate} onChange={e => { const copy = [...experiences]; copy[idx].endDate = e.target.value; setExperiences(copy); }} className={`${inputClass} disabled:opacity-50 disabled:bg-gray-200`} /></div>
                  </div>
                  
                  <label className="flex items-center gap-2 mb-4 cursor-pointer">
                    <input type="checkbox" checked={exp.currentlyWorking} onChange={e => { const copy = [...experiences]; copy[idx].currentlyWorking = e.target.checked; if(e.target.checked) copy[idx].endDate = ''; setExperiences(copy); }} className="w-4 h-4 text-[#1591DC] rounded border-gray-300 focus:ring-[#4BB8FA]"/>
                    <span className="text-sm font-semibold text-gray-700">I currently work here</span>
                  </label>
                  
                  <div>
                    <label className={labelClass}>Key Responsibilities (Optional)</label>
                    <textarea value={exp.responsibilities} onChange={e => { const copy = [...experiences]; copy[idx].responsibilities = e.target.value; setExperiences(copy); }} className={`${inputClass} h-24 resize-none`} placeholder="Briefly describe your role..." />
                  </div>
                </div>
              ))}
              
              {!isFresher && (
                <button type="button" onClick={() => setExperiences([...experiences, { company: '', designation: '', startDate: '', endDate: '', currentlyWorking: false, responsibilities: '' }])} className="text-[#1591DC] hover:text-[#2C5EAD] font-bold text-sm flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Add Another Experience
                </button>
              )}
              
              <div className="pt-6 flex justify-between border-t border-gray-100">
                <button type="button" onClick={() => setStep(2)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 px-6 rounded-lg transition duration-200">&larr; Back</button>
                <button type="submit" className="bg-[#1591DC] hover:bg-[#2C5EAD] text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300">Next: Final Step &rarr;</button>
              </div>
            </form>
          )}

          {/* STEP 4: RESUME & SUBMIT */}
          {step === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-fadeIn">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <label className={labelClass}>Upload Resume (PDF/DOC/DOCX) - Max 5MB *</label>
                <input type="file" accept=".pdf,.doc,.docx" required onChange={e => handleFileUpload(e, setResume, 5)} className="mt-2 w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C4E2F5] file:text-[#2C5EAD] hover:file:bg-[#4BB8FA] hover:file:text-white transition cursor-pointer" />
              </div>
              
              <div>
                <label className={labelClass}>Cover Note (Optional)</label>
                <textarea value={coverNote} onChange={e => setCoverNote(e.target.value)} className={`${inputClass} h-32 resize-none`} placeholder="Any additional information you'd like to share with the recruiter..." />
              </div>
              
              <div className="bg-[#C4E2F5] bg-opacity-30 p-5 rounded-lg border border-[#C4E2F5] space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required checked={consentAccuracy} onChange={e => setConsentAccuracy(e.target.checked)} className="w-5 h-5 mt-0.5 text-[#1591DC] rounded border-gray-300 focus:ring-[#4BB8FA]" />
                  <span className="text-sm font-semibold text-gray-800">I confirm that all information provided in this application is accurate and true to the best of my knowledge. *</span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" required checked={consentPrivacy} onChange={e => setConsentPrivacy(e.target.checked)} className="w-5 h-5 mt-0.5 text-[#1591DC] rounded border-gray-300 focus:ring-[#4BB8FA]" />
                  <span className="text-sm font-semibold text-gray-800">I accept the <a href="#" className="text-[#1591DC] underline">Privacy Policy</a> and consent to the processing of my personal data. *</span>
                </label>
              </div>

              <div className="pt-6 flex justify-between items-center border-t border-gray-100">
                <button type="button" onClick={() => setStep(3)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold py-3 px-6 rounded-lg transition duration-200">&larr; Back</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-extrabold py-3 px-8 rounded-lg shadow-md transition duration-300 transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}