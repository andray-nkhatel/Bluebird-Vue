<template>
    <div class="student-import">
      <div class="card">
        <div class="flex justify-content-between align-items-center mb-4">
          <h2 class="text-2xl font-semibold text-900 m-0">Import Students from CSV</h2>
          <Button 
            class="ml-auto"
            label="Back to List" 
            icon="pi pi-arrow-left" 
            @click="navigateToList"
            outlined
          />
        </div>
  
        <!-- Instructions Section -->
        <div class="mb-4">
          <div class="surface-50 border-round p-4 mb-3">
            <h3 class="text-lg font-medium text-900 mt-0 mb-3">
              <i class="pi pi-info-circle mr-2"></i>
              Import Instructions
            </h3>
            <div class="grid">
              <div class="col-12 md:col-6">
                <h4 class="font-medium text-900 mb-2">Required Columns:</h4>
                <ul class="text-600 line-height-3 pl-3">
                  <li>firstName</li>
                  <li>lastName</li>
                  <li>studentNumber</li>
                  <li>dateOfBirth (YYYY-MM-DD format)</li>
                  <li>gender</li>
                  <li>guardianName</li>
                  <li>guardianPhone</li>
                  <li>gradeId (numeric)</li>
                </ul>
              </div>
              <div class="col-12 md:col-6">
                <h4 class="font-medium text-900 mb-2">Optional Columns:</h4>
                <ul class="text-600 line-height-3 pl-3">
                  <li>middleName</li>
                  <li>address</li>
                  <li>phoneNumber</li>
                </ul>
              </div>
            </div>
          </div>
  
          <!-- Template Download -->
          <div class="flex gap-2 mb-4">
            <Button 
              label="Download Template" 
              icon="pi pi-download"
              @click="downloadTemplate"
              :loading="downloadingTemplate"
              outlined
              severity="help"
            />
            <Button 
              label="View Sample Data" 
              icon="pi pi-eye"
              @click="showSampleData = !showSampleData"
              :outlined="!showSampleData"
              severity="secondary"
            />
          </div>
  
          <!-- Sample Data Preview -->
          <div v-if="showSampleData" class="surface-50 border-round p-3 mb-4">
            <h4 class="font-medium text-900 mb-2">Sample CSV Data:</h4>
            <pre class="text-sm text-600 bg-gray-100 p-3 border-round overflow-auto">firstName,lastName,middleName,studentNumber,dateOfBirth,gender,address,phoneNumber,guardianName,guardianPhone,gradeId
  John,Doe,Michael,STU001,2010-05-15,Male,"123 Main St, City",555-0123,Jane Doe,555-0124,5
  Sarah,Smith,,STU002,2011-08-22,Female,"456 Oak Ave, Town",555-0125,Robert Smith,555-0126,4
  Michael,Johnson,Lee,STU003,2009-12-03,Male,"789 Pine Rd, Village",,Mary Johnson,555-0127,6</pre>
          </div>
        </div>
  
        <!-- File Upload Section -->
        <div class="border-2 border-dashed border-300 border-round p-6 text-center mb-4"
             :class="{ 'border-primary': dragActive, 'bg-primary-50': dragActive }"
             @dragover.prevent="dragActive = true"
             @dragleave.prevent="dragActive = false"
             @drop.prevent="handleDrop">
          
          <div v-if="!selectedFile">
            <i class="pi pi-cloud-upload text-6xl text-400 mb-3"></i>
            <h3 class="text-900 font-medium mb-2">Drop your CSV file here</h3>
            <p class="text-600 mb-3">or click to browse</p>
            <FileUpload 
              mode="basic" 
              :customUpload="true"
              @uploader="handleFileSelect"
              accept=".csv"
              :maxFileSize="10000000"
              chooseLabel="Select CSV File"
              class="p-button-outlined mr-3"
            />
            <p class="text-sm text-500 mt-2">Maximum file size: 10MB</p>
          </div>
  
          <div v-else class="text-left">
            <div class="flex align-items-center justify-content-between bg-white border-round p-3">
              <div class="flex align-items-center gap-3">
                <i class="pi pi-file text-2xl text-green-600"></i>
                <div>
                  <p class="font-medium text-900 mb-1">{{ selectedFile.name }}</p>
                  <p class="text-sm text-500">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
              </div>
              <Button 
                icon="pi pi-times" 
                @click="clearFile"
                text
                rounded
                severity="danger"
              />
            </div>
          </div>
        </div>
  
        <!-- File Analysis -->
        <div v-if="fileAnalysis" class="mb-4">
          <div class="surface-100 border-round p-4">
            <h4 class="font-medium text-900 mb-3">
              <i class="pi pi-chart-line mr-2"></i>
              File Analysis
            </h4>
            <div class="grid">
              <div class="col-12 sm:col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-900">{{ fileAnalysis.totalRows }}</div>
                  <div class="text-sm text-600">Total Rows</div>
                </div>
              </div>
              <div class="col-12 sm:col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ fileAnalysis.validRows }}</div>
                  <div class="text-sm text-600">Valid Rows</div>
                </div>
              </div>
              <div class="col-12 sm:col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-600">{{ fileAnalysis.invalidRows }}</div>
                  <div class="text-sm text-600">Invalid Rows</div>
                </div>
              </div>
              <div class="col-12 sm:col-6 md:col-3">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ fileAnalysis.columns.length }}</div>
                  <div class="text-sm text-600">Columns Found</div>
                </div>
              </div>
            </div>
            
            <!-- Column Mapping -->
            <div class="mt-4">
              <h5 class="font-medium text-900 mb-2">Detected Columns:</h5>
              <div class="flex flex-wrap gap-2">
                <Tag 
                  v-for="column in fileAnalysis.columns" 
                  :key="column"
                  :value="column"
                  :severity="requiredColumns.includes(column) ? 'success' : 'info'"
                />
              </div>
              
              <!-- Missing Required Columns -->
              <div v-if="missingColumns.length > 0" class="mt-3">
                <h5 class="font-medium text-red-600 mb-2">Missing Required Columns:</h5>
                <div class="flex flex-wrap gap-2">
                  <Tag 
                    v-for="column in missingColumns" 
                    :key="column"
                    :value="column"
                    severity="danger"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Preview Data -->
        <div v-if="previewData.length > 0" class="mb-4">
          <h4 class="font-medium text-900 mb-3">
            <i class="pi pi-table mr-2"></i>
            Data Preview (First 5 rows)
          </h4>
          <DataTable 
            :value="previewData.slice(0, 5)" 
            class="p-datatable-sm"
            showGridlines
          >
            <Column 
              v-for="column in fileAnalysis.columns" 
              :key="column"
              :field="column" 
              :header="column"
              style="min-width: 120px"
            >
              <template #body="{ data }">
                <span :class="{ 'text-red-600': !data[column] && requiredColumns.includes(column) }">
                  {{ data[column] || '-' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
  
        <!-- Import Actions -->
        <div class="flex gap-2 justify-content-end">
          <Button 
            label="Clear File" 
            icon="pi pi-times"
            @click="clearFile"
            outlined
            severity="secondary"
            :disabled="!selectedFile || importing"
          />
          <Button 
            label="Import Students" 
            icon="pi pi-upload"
            @click="importStudents"
            :disabled="!canImport"
            :loading="importing"
          />
        </div>
  
        <!-- Import Results -->
        <div v-if="importResults" class="mt-4">
          <div class="surface-100 border-round p-4">
            <h4 class="font-medium text-900 mb-3">
              <i class="pi pi-check-circle mr-2 text-green-600"></i>
              Import Results
            </h4>
            <div class="grid">
              <div class="col-12 sm:col-6 md:col-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ importResults.successful }}</div>
                  <div class="text-sm text-600">Successfully Imported</div>
                </div>
              </div>
              <div class="col-12 sm:col-6 md:col-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-red-600">{{ importResults.failed }}</div>
                  <div class="text-sm text-600">Failed to Import</div>
                </div>
              </div>
              <div class="col-12 sm:col-6 md:col-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ importResults.total }}</div>
                  <div class="text-sm text-600">Total Processed</div>
                </div>
              </div>
            </div>
  
            <!-- Error Details -->
            <div v-if="importResults.errors?.length > 0" class="mt-4">
              <h5 class="font-medium text-red-600 mb-2">Import Errors:</h5>
              <div class="max-h-20rem overflow-auto">
                <div 
                  v-for="(error, index) in importResults.errors" 
                  :key="index"
                  class="bg-red-50 border-l-4 border-red-400 p-3 mb-2"
                >
                  <p class="text-sm text-red-800">{{ error }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { studentService } from '@/service/api.service'; // Adjust path as needed
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
  

const router = useRouter();
  // Emits
  const emit = defineEmits(['back', 'studentsImported'])
  
  // Toast for notifications
  const toast = useToast()
  
  // Component state
  const selectedFile = ref(null)
  const dragActive = ref(false)
  const importing = ref(false)
  const downloadingTemplate = ref(false)
  const showSampleData = ref(false)
  const fileAnalysis = ref(null)
  const previewData = ref([])
  const importResults = ref(null)

  function navigateToList() {
    router.push({name: 'AddBulkStudent'});
  }
  
  // Required columns for validation
  const requiredColumns = [
    'firstName', 'lastName', 'studentNumber', 'dateOfBirth', 
    'gender', 'guardianName', 'guardianPhone', 'gradeId'
  ]
  
  // Computed properties
  const missingColumns = computed(() => {
    if (!fileAnalysis.value) return []
    return requiredColumns.filter(col => !fileAnalysis.value.columns.includes(col))
  })
  
  const canImport = computed(() => {
    return selectedFile.value && 
           fileAnalysis.value && 
           missingColumns.value.length === 0 &&
           fileAnalysis.value.validRows > 0 &&
           !importing.value
  })
  
  // File handling methods
  const handleFileSelect = (event) => {
    const file = event.files[0]
    if (file) {
      processFile(file)
    }
  }
  
  const handleDrop = (event) => {
    dragActive.value = false
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        processFile(file)
      } else {
        toast.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select a CSV file',
          life: 3000
        })
      }
    }
  }
  
  const processFile = async (file) => {
    selectedFile.value = file
    importResults.value = null
    
    try {
      // Read and analyze the file
      const text = await readFileAsText(file)
      analyzeCSV(text)
    } catch (error) {
      console.error('Error processing file:', error)
      toast.add({
        severity: 'error',
        summary: 'File Error',
        detail: 'Failed to read the CSV file',
        life: 3000
      })
    }
  }
  
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }
  
  const analyzeCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length === 0) return
  
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    // Parse data rows
    const dataRows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      return row
    })
  
    // Analyze data quality
    let validRows = 0
    dataRows.forEach(row => {
      const hasAllRequired = requiredColumns.every(col => row[col] && row[col].trim())
      if (hasAllRequired) validRows++
    })
  
    fileAnalysis.value = {
      totalRows: dataRows.length,
      validRows,
      invalidRows: dataRows.length - validRows,
      columns: headers
    }
  
    previewData.value = dataRows
  }
  
  const clearFile = () => {
    selectedFile.value = null
    fileAnalysis.value = null
    previewData.value = []
    importResults.value = null
    dragActive.value = false
  }
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Download template
  const downloadTemplate = async () => {
    downloadingTemplate.value = true
    try {
      const blob = await studentService.downloadTemplate()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'student_import_template.csv'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
  
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Template downloaded successfully',
        life: 3000
      })
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.add({
        severity: 'error',
        summary: 'Download Error',
        detail: 'Failed to download template',
        life: 3000
      })
    } finally {
      downloadingTemplate.value = false
    }
  }
  
  // Import students
  const importStudents = async () => {
    if (!selectedFile.value) return
  
    importing.value = true
    try {
      const result = await studentService.importFromCsv(selectedFile.value)
      
      // Handle the import result based on your API response structure
      importResults.value = {
        successful: result.successful || result.successCount || 0,
        failed: result.failed || result.errorCount || 0,
        total: result.total || result.totalProcessed || 0,
        errors: result.errors || []
      }
  
      toast.add({
        severity: 'success',
        summary: 'Import Complete',
        detail: `Successfully imported ${importResults.value.successful} students`,
        life: 5000
      })
  
      // Emit event to parent component
      emit('studentsImported', importResults.value)
  
    } catch (error) {
      console.error('Error importing students:', error)
      
      // Handle error response
      const errorMessage = error.response?.data?.message || 'Failed to import students'
      const errors = error.response?.data?.errors || [errorMessage]
      
      importResults.value = {
        successful: 0,
        failed: fileAnalysis.value?.totalRows || 0,
        total: fileAnalysis.value?.totalRows || 0,
        errors: Array.isArray(errors) ? errors : [errors]
      }
  
      toast.add({
        severity: 'error',
        summary: 'Import Failed',
        detail: errorMessage,
        life: 5000
      })
    } finally {
      importing.value = false
    }
  }
  </script>
  
  <style scoped>
  .student-import {
    padding: 1rem;
  }
  
  .card {
    /* background: white; */
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .border-dashed {
    border-style: dashed;
  }
  
  .drag-active {
    border-color: var(--primary-color);
    background-color: var(--primary-50);
  }
  
  pre {
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  
  .max-h-20rem {
    max-height: 20rem;
  }
  
  :deep(.p-fileupload-basic) {
    display: inline-block;
  }
  
  :deep(.p-tag) {
    font-size: 0.75rem;
  }
  </style>