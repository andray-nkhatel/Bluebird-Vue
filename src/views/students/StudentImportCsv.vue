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
              <h4 class="font-medium text-900 mb-2">Required Columns (Minimum):</h4>
              <ul class="text-600 line-height-3 pl-3">
                <li><strong>firstName</strong> (or FirstName)</li>
                <li><strong>lastName</strong> (or LastName)</li>
                <li><strong>gradeId</strong> (or GradeId) - numeric</li>
              </ul>
              <div class="mt-2 p-2 bg-green-50 border-round">
                <small class="text-green-800">
                  <i class="pi pi-check-circle mr-1"></i>
                  Only these 3 columns are required to proceed with import.
                </small>
              </div>
            </div>
            <div class="col-12 md:col-6">
              <h4 class="font-medium text-900 mb-2">Optional Columns:</h4>
              <ul class="text-600 line-height-3 pl-3">
                <li>middleName (or MiddleName)</li>
                <li>studentNumber (or StudentNumber)</li>
                <li>dateOfBirth (or DateOfBirth) - YYYY-MM-DD format</li>
                <li>gender (or Gender)</li>
                <li>address (or Address)</li>
                <li>phoneNumber (or PhoneNumber)</li>
                <li>guardianName (or GuardianName)</li>
                <li>guardianPhone (or GuardianPhone)</li>
              </ul>
              <div class="mt-3 p-2 bg-blue-50 border-round">
                <small class="text-blue-800">
                  <i class="pi pi-info-circle mr-1"></i>
                  Headers are case-insensitive. Both camelCase and PascalCase are supported.
                </small>
              </div>
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
          <div class="mt-2 p-2 bg-yellow-50 border-round">
            <small class="text-yellow-800">
              <i class="pi pi-exclamation-triangle mr-1"></i>
              <strong>Minimal Example:</strong> You can import with just: firstName,lastName,gradeId
            </small>
          </div>
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
            @select="handleFileSelect"
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
                <div class="text-2xl font-bold text-blue-600">{{ fileAnalysis.originalColumns.length }}</div>
                <div class="text-sm text-600">Columns Found</div>
              </div>
            </div>
          </div>
          
          <!-- Column Mapping -->
          <div class="mt-4">
            <h5 class="font-medium text-900 mb-2">Detected Columns:</h5>
            <div class="flex flex-wrap gap-2">
              <Tag 
                v-for="column in fileAnalysis.originalColumns" 
                :key="column"
                :value="column"
                :severity="isRequiredColumnMatched(column) ? 'success' : 'info'"
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

            <!-- Column Mapping Info -->
            <div v-if="fileAnalysis.columnMapping && Object.keys(fileAnalysis.columnMapping).length > 0" class="mt-3">
              <h5 class="font-medium text-900 mb-2">Column Mapping:</h5>
              <div class="grid">
                <div v-for="(originalCol, normalizedCol) in fileAnalysis.columnMapping" :key="normalizedCol" class="col-12 md:col-6 lg:col-4">
                  <div class="text-sm p-2 bg-green-50 border-round">
                    <strong>{{ originalCol }}</strong> → {{ normalizedCol }}
                  </div>
                </div>
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
            v-for="column in fileAnalysis.originalColumns" 
            :key="column"
            :field="column" 
            :header="column"
            style="min-width: 120px"
          >
            <template #body="{ data }">
              <span :class="{ 'text-red-600': !data[column] && isRequiredColumnMatched(column) }">
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

      <!-- Debug Information (remove this in production) -->
      <!-- <div v-if="fileAnalysis" class="mt-4 p-3 bg-yellow-50 border-round">
        <h5 class="font-medium text-900 mb-2">Debug Information:</h5>
        <div class="text-sm">
          <p><strong>Selected File:</strong> {{ !!selectedFile }}</p>
          <p><strong>File Analysis:</strong> {{ !!fileAnalysis }}</p>
          <p><strong>Missing Columns:</strong> {{ missingColumns.length }} ({{ missingColumns.join(', ') }})</p>
          <p><strong>Valid Rows:</strong> {{ fileAnalysis.validRows }}</p>
          <p><strong>Can Import:</strong> {{ canImport }}</p>
          <p><strong>Required Columns:</strong> {{ requiredColumns.join(', ') }}</p>
          <p><strong>Detected Columns (normalized):</strong> {{ fileAnalysis.originalColumns.map(col => normalizeColumnName(col)).join(', ') }}</p>
        </div>
      </div>
      -->

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

// Required columns for validation (normalized to lowercase)
const requiredColumns = [
  'firstname', 'lastname', 'gradeid'
]

// Helper function to normalize column names for comparison
const normalizeColumnName = (columnName) => {
  return columnName.toLowerCase().trim()
}

// Helper function to create column mapping from original to normalized names
const createColumnMapping = (originalHeaders) => {
  const mapping = {}
  originalHeaders.forEach(header => {
    const normalized = normalizeColumnName(header)
    mapping[normalized] = header
  })
  return mapping
}

// Helper function to check if a column matches any required column (case-insensitive)
const isRequiredColumnMatched = (originalColumnName) => {
  const normalized = normalizeColumnName(originalColumnName)
  return requiredColumns.includes(normalized)
}

// Computed properties
const missingColumns = computed(() => {
  if (!fileAnalysis.value) return []
  
  const normalizedDetectedColumns = fileAnalysis.value.originalColumns.map(col => normalizeColumnName(col))
  const missing = requiredColumns.filter(requiredCol => !normalizedDetectedColumns.includes(requiredCol))
  

  
  return missing
})

const canImport = computed(() => {
  const hasFile = !!selectedFile.value
  const hasAnalysis = !!fileAnalysis.value
  const noMissingColumns = missingColumns.value.length === 0
  const hasValidRows = fileAnalysis.value ? fileAnalysis.value.validRows > 0 : false
  const notImporting = !importing.value
  
  const result = hasFile && hasAnalysis && noMissingColumns && hasValidRows && notImporting
         
  // Debug logging
  // console.log('Can import check:')
  // console.log('- selectedFile:', hasFile)
  // console.log('- fileAnalysis:', hasAnalysis)
  // console.log('- missingColumns.length:', missingColumns.value.length)
  // console.log('- validRows:', fileAnalysis.value?.validRows || 0)
  // console.log('- importing:', importing.value)
  // console.log('- canImport result:', result)
  
  return result
})

// File handling methods - FIXED VERSION
const handleFileSelect = (event) => {
  console.log('handleFileSelect called with event:', event)
  
  // PrimeVue FileUpload with customUpload passes files in event.files
  // But sometimes it might be in a different structure
  let file = null
  
  if (event.files && event.files.length > 0) {
    file = event.files[0]
  } else if (event.target && event.target.files && event.target.files.length > 0) {
    file = event.target.files[0]
  } else if (Array.isArray(event) && event.length > 0) {
    file = event[0]
  }
  
  console.log('Extracted file:', file)
  
  if (file) {
    // Validate file type
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
  } else {
    console.error('No file found in event:', event)
    toast.add({
      severity: 'error',
      summary: 'File Error',
      detail: 'No file was selected',
      life: 3000
    })
  }
}

const handleDrop = (event) => {
  dragActive.value = false
  const files = event.dataTransfer.files
  console.log('handleDrop called with files:', files)
  
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
  console.log('Processing file:', file.name, file.size, file.type)
  selectedFile.value = file
  importResults.value = null
  
  try {
    // Read and analyze the file
    const text = await readFileAsText(file)
    console.log('File read successfully, length:', text.length)
    console.log('First 200 characters:', text.substring(0, 200))
    analyzeCSV(text)
  } catch (error) {
    console.error('Error processing file:', error)
    selectedFile.value = null // Reset on error
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
  if (lines.length === 0) {
    console.log('No lines found in CSV')
    return
  }

  // Parse header - keep original headers for display purposes
  // Handle both comma and semicolon separators, and quoted fields
  const headerLine = lines[0]
  let originalHeaders = []
  
  // Simple CSV parsing - handles quoted fields
  if (headerLine.includes('"')) {
    // More complex parsing for quoted fields
    const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/
    originalHeaders = headerLine.split(regex).map(h => h.trim().replace(/^"|"$/g, ''))
  } else {
    // Simple split for unquoted fields
    originalHeaders = headerLine.split(',').map(h => h.trim())
  }
  
  console.log('Original headers found:', originalHeaders)
  
  // Create column mapping for case-insensitive matching
  const columnMapping = createColumnMapping(originalHeaders)
  console.log('Column mapping:', columnMapping)
  
  // Parse data rows
  const dataRows = lines.slice(1).map((line, index) => {
    let values = []
    if (line.includes('"')) {
      const regex = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/
      values = line.split(regex).map(v => v.trim().replace(/^"|"$/g, ''))
    } else {
      values = line.split(',').map(v => v.trim())
    }
    
    const row = {}
    originalHeaders.forEach((header, headerIndex) => {
      row[header] = values[headerIndex] || ''
    })
    return row
  })

  console.log('Sample data row:', dataRows[0])

  // Analyze data quality using case-insensitive column matching
  let validRows = 0
  dataRows.forEach(row => {
    const hasAllRequired = requiredColumns.every(requiredCol => {
      // Find the original column name that matches this required column
      const originalColumnName = originalHeaders.find(originalCol => 
        normalizeColumnName(originalCol) === requiredCol
      )
      const hasValue = originalColumnName && row[originalColumnName] && row[originalColumnName].trim()
      return hasValue
    })
    if (hasAllRequired) validRows++
  })

  console.log('Analysis complete:', {
    totalRows: dataRows.length,
    validRows,
    invalidRows: dataRows.length - validRows
  })

  fileAnalysis.value = {
    totalRows: dataRows.length,
    validRows,
    invalidRows: dataRows.length - validRows,
    originalColumns: originalHeaders, // Keep original headers for display
    columnMapping // Store mapping for reference
  }

  previewData.value = dataRows
  
  // Show success message if all required columns are found
  if (missingColumns.value.length === 0 && originalHeaders.length > 0) {
    toast.add({
      severity: 'success',
      summary: 'File Validated',
      detail: `CSV file processed successfully. Found ${validRows} valid rows out of ${dataRows.length} total rows.`,
      life: 4000
    })
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Missing Columns',
      detail: `Missing required columns: ${missingColumns.value.join(', ')}`,
      life: 5000
    })
  }
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