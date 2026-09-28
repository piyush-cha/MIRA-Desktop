def polish_expert_reviews():
    css_override = """
/* Expert Review Page Polish */
.action-btn-circle {
  border-radius: 6px !important;
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
  transition: all 0.2s ease !important;
  width: 28px !important;
  height: 28px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05) !important;
}

.action-btn-circle.approve {
  color: #10b981 !important;
}
.action-btn-circle.approve:hover {
  background: #10b981 !important;
  color: #fff !important;
  border-color: #10b981 !important;
}

.action-btn-circle.reject {
  color: #ef4444 !important;
}
.action-btn-circle.reject:hover {
  background: #ef4444 !important;
  color: #fff !important;
  border-color: #ef4444 !important;
}

.action-btn-circle.reassign {
  color: #3b82f6 !important;
}
.action-btn-circle.reassign:hover {
  background: #3b82f6 !important;
  color: #fff !important;
  border-color: #3b82f6 !important;
}

.status-pill.high {
  background: transparent !important;
  border: 1px solid rgba(239, 68, 68, 0.4) !important;
  color: #dc2626 !important;
  font-weight: 700 !important;
  box-shadow: inset 0 0 4px rgba(239, 68, 68, 0.05) !important;
}

.status-pill.medium {
  background: transparent !important;
  border: 1px solid rgba(245, 158, 11, 0.4) !important;
  color: #d97706 !important;
  font-weight: 700 !important;
  box-shadow: inset 0 0 4px rgba(245, 158, 11, 0.05) !important;
}

.confidence-bar {
  background: #e2e8f0 !important;
  border-radius: 4px !important;
  height: 6px !important;
  overflow: hidden !important;
  width: 60px !important;
}
.confidence-fill {
  border-radius: 4px !important;
  height: 100% !important;
}
.confidence-wrapper {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.confidence-wrapper span {
  font-weight: 600 !important;
  color: #475569 !important;
}

.gov-data-table td {
  padding: 16px 12px !important;
  vertical-align: middle !important;
  border-bottom: 1px solid #f1f5f9 !important;
  color: #334155 !important;
}
.gov-data-table tr:hover td {
  background: #f8fafc !important;
}
.gov-data-table th {
  color: #64748b !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  font-size: 11px !important;
  border-bottom: 1px solid #e2e8f0 !important;
  padding-bottom: 12px !important;
}
"""
    with open('src/index.css', 'a', encoding='utf-8') as f:
        f.write(css_override)
    print("Success: Appended professional overrides to index.css")

if __name__ == '__main__':
    polish_expert_reviews()
