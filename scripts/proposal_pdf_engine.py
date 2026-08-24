#!/usr/bin/env python3
"""
Contribo Proposal PDF Generation Engine
Generates publication-quality proposal PDFs from JSON data using ReportLab.
"""

import sys
import json
import os
import io
import re
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable,
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and render total page count."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#78716C"))

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#E7E5E4"))
            self.setLineWidth(0.5)
            self.line(40, 755, 572, 755)
            self.drawString(40, 762, "Contribo — Open Source Project Proposal")
            self.drawRightString(572, 762, datetime.now().strftime("%B %Y"))

        # Running Footer (all pages)
        self.setStrokeColor(colors.HexColor("#E7E5E4"))
        self.setLineWidth(0.5)
        self.line(40, 42, 572, 42)
        self.drawString(40, 30, "Generated via Contribo Proposal Studio")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 30, page_str)
        self.restoreState()


def clean_text_for_xml(text):
    """Sanitize and convert raw Markdown/plain text into ReportLab XML-safe markup."""
    if not text:
        return ""
    # XML entity replacement
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

    # Bold: **text** -> <b>text</b>
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Italic: *text* or _text_ -> <i>text</i>
    text = re.sub(r"(?<!\*)\*([^*]+?)\*(?!\*)", r"<i>\1</i>", text)
    # Inline code: `code` -> <font name="Courier" color="#C2410C">code</font>
    text = re.sub(
        r"`([^`]+?)`",
        r'<font name="Courier" color="#C2410C" size="9">\1</font>',
        text,
    )
    return text


def build_proposal_pdf(proposal_data, output_stream):
    """Construct the proposal PDF flowables and build the document."""
    doc = SimpleDocTemplate(
        output_stream,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=48,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom styles adhering to Contribo aesthetic
    PRIMARY_COLOR = colors.HexColor("#2B1B15")
    ACCENT_COLOR = colors.HexColor("#D97706")  # Warm Amber / Terracotta
    TEXT_MAIN = colors.HexColor("#1C1917")
    TEXT_MUTED = colors.HexColor("#57534E")
    BORDER_COLOR = colors.HexColor("#E7E5E4")
    BG_CARD = colors.HexColor("#FBF9F6")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=PRIMARY_COLOR,
        spaceAfter=8,
    )

    section_heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=PRIMARY_COLOR,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=TEXT_MAIN,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "DocBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
        leftIndent=14,
        spaceAfter=3,
    )

    meta_label_style = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=TEXT_MUTED,
    )

    meta_val_style = ParagraphStyle(
        "MetaValue",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=12,
        textColor=PRIMARY_COLOR,
    )

    story = []

    # 1. Document Title
    title = proposal_data.get("title") or "Open Source Project Proposal"
    story.append(Paragraph(clean_text_for_xml(title), title_style))

    # 2. Metadata Grid Banner
    program = proposal_data.get("program") or "Google Summer of Code"
    org_name = (
        proposal_data.get("targetOrg")
        or proposal_data.get("orgName")
        or "Open Source Organization"
    )
    year = str(proposal_data.get("year") or datetime.now().year)
    author = proposal_data.get("author") or "Applicant / Contributor"
    status = (proposal_data.get("status") or "Draft").upper()

    meta_data = [
        [
            Paragraph("TARGET PROGRAM", meta_label_style),
            Paragraph("ORGANIZATION", meta_label_style),
            Paragraph("YEAR / TIMELINE", meta_label_style),
            Paragraph("STATUS", meta_label_style),
        ],
        [
            Paragraph(clean_text_for_xml(program), meta_val_style),
            Paragraph(clean_text_for_xml(org_name), meta_val_style),
            Paragraph(clean_text_for_xml(year), meta_val_style),
            Paragraph(
                f'<font color="#D97706"><b>{clean_text_for_xml(status)}</b></font>',
                meta_val_style,
            ),
        ],
    ]

    meta_table = Table(meta_data, colWidths=[133, 145, 134, 120])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BG_CARD),
                ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 3. Standard Proposal Sections
    SECTION_TITLES = {
        "abstract": "1. Executive Summary & Abstract",
        "problem": "2. Problem Statement & Motivation",
        "solution": "3. Proposed Solution & Architecture",
        "deliverables": "4. Key Deliverables & Expected Outcomes",
        "timeline": "5. Project Timeline & Milestones",
        "testing": "6. Testing Strategy & Quality Assurance",
        "risks": "7. Risk Assessment & Contingency Plan",
        "experience": "8. Contributor Background & Previous Contributions",
    }

    # Extract sections dictionary or array
    sections_dict = {}
    raw_sections = proposal_data.get("sections")
    if isinstance(raw_sections, dict):
        sections_dict = raw_sections
    elif isinstance(raw_sections, list):
        for s in raw_sections:
            if isinstance(s, dict) and "id" in s:
                sections_dict[s["id"]] = s.get("content") or s.get("body", "")

    # Iterate through sections in standard order
    for idx, (sec_key, sec_title) in enumerate(SECTION_TITLES.items()):
        content = sections_dict.get(sec_key, "").strip()
        if not content and "sections" not in proposal_data:
            content = proposal_data.get(sec_key, "").strip()

        # Section Header Banner
        story.append(
            HRFlowable(
                width="100%",
                thickness=0.75,
                color=BORDER_COLOR,
                spaceBefore=6,
                spaceAfter=6,
            )
        )
        story.append(Paragraph(sec_title, section_heading_style))

        if not content:
            story.append(
                Paragraph(
                    "<i>Section content pending drafting in Proposal Studio.</i>",
                    ParagraphStyle(
                        "EmptySec",
                        parent=body_style,
                        textColor=TEXT_MUTED,
                    ),
                )
            )
            story.append(Spacer(1, 6))
            continue

        # Parse paragraphs & bullet points
        lines = content.split("\n")
        in_code_block = False
        code_lines = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                story.append(Spacer(1, 4))
                continue

            # Code fence handling
            if stripped.startswith("```"):
                if in_code_block:
                    # End code block
                    code_text = "<br/>".join(
                        clean_text_for_xml(cl) for cl in code_lines
                    )
                    code_p = Paragraph(
                        code_text,
                        ParagraphStyle(
                            "CodeBlock",
                            parent=styles["Normal"],
                            fontName="Courier",
                            fontSize=8,
                            leading=11,
                            textColor=PRIMARY_COLOR,
                            backColor=colors.HexColor("#F5F5F4"),
                            leftIndent=8,
                            rightIndent=8,
                            spaceBefore=4,
                            spaceAfter=4,
                        ),
                    )
                    story.append(code_p)
                    code_lines = []
                    in_code_block = False
                else:
                    in_code_block = True
                continue

            if in_code_block:
                code_lines.append(line)
                continue

            # Bullet points
            if stripped.startswith(("- ", "* ", "• ")):
                bullet_text = clean_text_for_xml(stripped[2:])
                story.append(
                    Paragraph(f"&bull; {bullet_text}", bullet_style)
                )
            elif re.match(r"^\d+\.\s+", stripped):
                match = re.match(r"^(\d+\.)\s+(.+)$", stripped)
                if match:
                    num_prefix, num_text = match.groups()
                    story.append(
                        Paragraph(
                            f"<b>{num_prefix}</b> {clean_text_for_xml(num_text)}",
                            bullet_style,
                        )
                    )
                else:
                    story.append(Paragraph(clean_text_for_xml(stripped), body_style))
            else:
                story.append(Paragraph(clean_text_for_xml(stripped), body_style))

        story.append(Spacer(1, 6))

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)


def main():
    """CLI / stdin handler."""
    if len(sys.argv) > 1 and sys.argv[1] != "-":
        input_file = sys.argv[1]
        with open(input_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        # Read from stdin
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print("Error: No proposal JSON provided", file=sys.stderr)
            sys.exit(1)
        data = json.loads(raw_input)

    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    if output_path:
        with open(output_path, "wb") as f:
            build_proposal_pdf(data, f)
        print(f"Successfully generated PDF: {output_path}")
    else:
        # Write binary to stdout buffer
        buf = io.BytesIO()
        build_proposal_pdf(data, buf)
        sys.stdout.buffer.write(buf.getvalue())


if __name__ == "__main__":
    main()
