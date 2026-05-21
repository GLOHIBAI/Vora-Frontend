import React from 'react';
import { CloseIcon } from '../common/Icons';
import Select from '../common/Select';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import type { EditRoleModalProps } from '../../types';

const EditRoleModal: React.FC<EditRoleModalProps> = ({ isOpen, onClose, initialData }) => {
  const [roleType, setRoleType] = React.useState(initialData?.type || '');
  const [level, setLevel] = React.useState(initialData?.level || '');
  const [timeZone, setTimeZone] = React.useState(initialData?.timeZone || '');
  const [workFormat, setWorkFormat] = React.useState(initialData?.workFormat || '');
  const [location, setLocation] = React.useState(initialData?.location || '');

  if (!isOpen) return null;

  const roleTypeOptions = [
    { label: 'Internship', value: 'internship' },
    { label: 'Full-time', value: 'full-time' },
    { label: 'Part-time', value: 'part-time' },
  ];

  const levelOptions = [
    { label: 'Entry Level', value: 'entry' },
    { label: 'Mid Level', value: 'mid' },
    { label: 'Senior Level', value: 'senior' },
  ];

  const timeZoneOptions = [
    { label: 'GMT + 1', value: 'gmt+1' },
    { label: 'GMT + 0', value: 'gmt+0' },
    { label: 'EST', value: 'est' },
  ];

  const workFormatOptions = [
    { label: 'Onsite', value: 'onsite' },
    { label: 'Remote', value: 'remote' },
    { label: 'Hybrid', value: 'hybrid' },
  ];

  const locationOptions = [
    { label: 'Lagos, Nigeria', value: 'lagos' },
    { label: 'London, UK', value: 'london' },
    { label: 'New York, USA', value: 'new-york' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
          <h2 className="text-[18px] font-medium text-gray-900 ">Edit Role Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <CloseIcon size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-8 py-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Role Title */}
            <Input 
              label="Role title"
              type="text"
              placeholder="e.g. Global Health Research Intern"
              defaultValue={initialData?.title}
            />

            {/* Role Type */}
            <Select 
              label="Role type"
              name="roleType"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              options={roleTypeOptions}
              placeholder="Select options"
            />

            {/* Employment Level */}
            <Select 
              label="Employment level"
              name="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              options={levelOptions}
              placeholder="Select option"
            />

            {/* Available Positions */}
            <Input 
              label="Available positions"
              type="text"
              placeholder="e.g. 1, 2, 3 etc"
            />

            {/* Time Commitment */}
            <Input 
              label="Time commitment"
              type="text"
              placeholder="e.g. 20hrs per week"
            />

            {/* Time zone preference */}
            <Select 
              label="Time zone preference"
              name="timeZone"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              options={timeZoneOptions}
              placeholder="Select option"
            />

            {/* Work format */}
            <Select 
              label="Work format"
              name="workFormat"
              value={workFormat}
              onChange={(e) => setWorkFormat(e.target.value)}
              options={workFormatOptions}
              placeholder="Select option"
            />

            {/* Work location */}
            <Select 
              label="Work location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              options={locationOptions}
              placeholder="Search location"
            />

            {/* Start date */}
            <Input 
              label="Start date"
              type="date"
              placeholder="Select date"
            />

            {/* End date */}
            <Input 
              label="End date"
              type="date"
              placeholder="End date"
            />

            {/* Role summary */}
            <div className="col-span-2 pt-2">
              <Textarea 
                label="Role summary"
                rows={4}
                placeholder="Briefly describe what the role is about"
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-8">
          <Button onClick={onClose}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditRoleModal;
