// General Comment Methods for ScoresEntry.vue
// Add these methods to the methods section of ScoresEntry.vue

// General Comment Methods
async openGeneralCommentDialog(student) {
  this.generalCommentStudent = student;
  this.generalCommentText = '';
  this.generalCommentLoading = false;
  this.reportCardId = null;
  
  try {
    // First, we need to get or create a report card for this student
    await this.ensureReportCardExists(student);
    
    // Load existing general comment if report card exists
    if (this.reportCardId) {
      await this.loadGeneralComment();
    }
    
    this.showGeneralCommentDialog = true;
  } catch (error) {
    console.error('Error opening general comment dialog:', error);
    this.showError('Failed to open general comment dialog. Please try again.');
  }
},

async ensureReportCardExists(student) {
  try {
    // Check if report card already exists for this student
    const existingReportCards = await examService.getStudentReportCards(student.studentId);
    const existingReportCard = existingReportCards.find(rc => 
      rc.academicYear === this.selectedAcademicYear && 
      rc.term === this.selectedTerm
    );
    
    if (existingReportCard) {
      this.reportCardId = existingReportCard.id;
      return;
    }
    
    // Generate report card if it doesn't exist
    const reportCard = await examService.generateReportCard(
      student.studentId,
      this.selectedAcademicYear,
      this.selectedTerm
    );
    
    this.reportCardId = reportCard.id;
  } catch (error) {
    console.error('Error ensuring report card exists:', error);
    throw error;
  }
},

async loadGeneralComment() {
  if (!this.reportCardId) return;
  
  try {
    this.generalCommentLoading = true;
    const comment = await examService.getGeneralComment(this.reportCardId);
    this.generalCommentText = comment || '';
  } catch (error) {
    console.error('Error loading general comment:', error);
    // Don't show error for empty comments, just set empty string
    this.generalCommentText = '';
  } finally {
    this.generalCommentLoading = false;
  }
},

async saveGeneralComment() {
  if (!this.reportCardId || !this.generalCommentText.trim()) {
    this.showError('Please enter a comment before saving.');
    return;
  }
  
  try {
    this.generalCommentLoading = true;
    await examService.updateGeneralComment(this.reportCardId, this.generalCommentText.trim());
    this.showSuccess('General comment saved successfully!');
    this.closeGeneralCommentDialog();
  } catch (error) {
    console.error('Error saving general comment:', error);
    this.showError('Failed to save general comment. Please try again.');
  } finally {
    this.generalCommentLoading = false;
  }
},

async clearGeneralComment() {
  if (!this.reportCardId) return;
  
  try {
    this.generalCommentLoading = true;
    await examService.updateGeneralComment(this.reportCardId, '');
    this.generalCommentText = '';
    this.showSuccess('General comment cleared successfully!');
  } catch (error) {
    console.error('Error clearing general comment:', error);
    this.showError('Failed to clear general comment. Please try again.');
  } finally {
    this.generalCommentLoading = false;
  }
},

closeGeneralCommentDialog() {
  this.showGeneralCommentDialog = false;
  this.generalCommentStudent = null;
  this.generalCommentText = '';
  this.generalCommentLoading = false;
  this.reportCardId = null;
}

