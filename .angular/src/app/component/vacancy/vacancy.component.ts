import { Component } from '@angular/core';

@Component({
  selector: 'app-vacancy',
  templateUrl: './vacancy.component.html',
  styleUrls: ['./vacancy.component.css']
})
export class VacancyComponent {
  jobs = [
    {
      title: 'जिला संवाददाता (District Correspondent)',
      location: 'रांची, धनबाद, बोकारो, गिरिडीह, दुमका (सभी 24 जिले)',
      experience: '1-3 वर्ष का मीडिया अनुभव',
      type: 'फुल टाइम / पार्ट टाइम',
      desc: 'जिले की स्थानीय, राजनीतिक और सामाजिक घटनाओं की त्वरित एवं सटीक रिपोर्टिंग।'
    },
    {
      title: 'डिजिटल कंटेंट राइटर (Hindi Content Writer)',
      location: 'रांची कार्यालय / वर्क फ्रॉम होम',
      experience: '0-2 वर्ष (ताज़ा स्नातकों का स्वागत है)',
      type: 'फुल टाइम',
      desc: 'हिंदी में त्वरित समाचार लेखन, तथ्य सत्यापन और आकर्षक हेडलाइंस बनाना।'
    },
    {
      title: 'वीडियो एडिटर एवं ग्राफिक डिज़ाइनर',
      location: 'रांची कार्यालय',
      experience: '1-4 वर्ष (Premiere Pro / Photoshop)',
      type: 'फुल टाइम',
      desc: 'यूट्यूब समाचार बुलेटिन, रील्स और थंबनेल डिज़ाइन तैयार करना।'
    }
  ];

  selectedJob: string = '';
  applied: boolean = false;
  applicant = { name: '', phone: '', email: '', resumeUrl: '', note: '' };

  openApply(jobTitle: string) {
    this.selectedJob = jobTitle;
    this.applied = false;
  }

  submitApplication() {
    if (this.applicant.name && this.applicant.phone) {
      this.applied = true;
    }
  }
}
