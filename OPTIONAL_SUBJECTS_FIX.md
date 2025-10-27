# Optional Subjects API Fix

## Problem Identified
The pathway assignment was working (✅ 200 response), but the optional subjects assignment was failing with a validation error:

```
❌ 400 /students/102/assign-optional-subjects 
Object { type: "https://tools.ietf.org/html/rfc9110#section-15.5.1", title: "One or more validation errors occurred.", status: 400, errors: {…} }
```

## Root Cause
**Case sensitivity mismatch** between frontend and backend:

- **Frontend was sending**: `subjectIds` (lowercase)
- **Backend expected**: `SubjectIds` (PascalCase)
- **C# DTO property**: `public List<int> SubjectIds { get; set; }`

## Solution Applied

### 1. **Fixed API Service Method**
```javascript
// OLD (incorrect):
async assignOptionalSubjects(studentId, subjectIds) {
  const response = await apiClient.post(`/students/${studentId}/assign-optional-subjects`, {
    subjectIds: subjectIds  // ← lowercase
  });
  return response.data;
}

// NEW (correct):
async assignOptionalSubjects(studentId, subjectIds) {
  const response = await apiClient.post(`/students/${studentId}/assign-optional-subjects`, {
    SubjectIds: subjectIds  // ← PascalCase
  });
  return response.data;
}
```

### 2. **Simplified Frontend Call**
```javascript
// OLD (complex):
await studentService.assignOptionalSubjects(selectedStudent.value, {
  SubjectIds: selectedOptionalSubjects.value
});

// NEW (simplified):
await studentService.assignOptionalSubjects(selectedStudent.value, selectedOptionalSubjects.value);
```

## Backend DTO Structure
```csharp
public class AssignOptionalSubjectsDto
{
    public List<int> SubjectIds { get; set; } = new List<int>();  // ← PascalCase
}
```

## Expected Results

### Before Fix:
- ✅ Pathway assignment: `200 OK`
- ❌ Optional subjects: `400 Bad Request` (validation error)

### After Fix:
- ✅ Pathway assignment: `200 OK`
- ✅ Optional subjects: `200 OK`
- ✅ Complete curriculum selection process

## Testing the Fix

1. **Navigate to Former Curriculum Selection**
2. **Select a student** (secondary school student)
3. **Choose "Legacy" curriculum type**
4. **Select a pathway** (e.g., "Former Grade 9")
5. **Select optional subjects** (if any)
6. **Click "Assign Pathway"**

### Expected Console Output:
```
🚀 PUT /students/102/pathway 
✅ 200 /students/102/pathway 
🚀 POST /students/102/assign-optional-subjects 
✅ 200 /students/102/assign-optional-subjects  // ← Should now be 200
```

## Files Modified

1. **`src/service/api.service.js`** - Fixed case sensitivity in API call
2. **`src/views/students/FormerCurriculumSubjectSelection.vue`** - Simplified method call

The fix ensures that the optional subjects assignment uses the correct property name that matches the backend DTO structure.
