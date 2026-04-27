Under review as a conference paper at COLM 2025
Formatting Instructions for COLM 2025
Conference Submissions
Anonymous authors
Paper under double-blind review
Abstract
The abstract paragraph should be indented 1/2 inch (3 picas) on both
1
left and right-hand margins. Use 10 point type, with a vertical spacing of
2
11 points. The word Abstract must be centered and in point size 12. Two line
3
spaces precede the abstract. The abstract must be limited to one paragraph.
4
1
Submission of conference papers to COLM 2025
5
COLM requires electronic submissions, processed by https://openreview.net/.
See
6
COLM’s website for more instructions. The format for the submissions is a variant of
7
the NeurIPS and ICLR formats. Please read carefully the instructions below, and follow
8
them faithfully.
9
1.1
Style
10
Papers to be submitted to COLM 2025 must be prepared according to the instructions
11
presented here.
12
Authors are required to use the COLM LATEX style files obtainable at the COLM website.
13
Please make sure you use the current files and not previous versions. Tweaking the style
14
files may be grounds for rejection.
15
1.1.1
Copy Options
16
If your paper is ultimately accepted,
the option \final should be set for the
17
\usepackage[submission]{colm2025 conference} command for the camera ready version.
18
The submission options is the default, and is to be used for all submissions during the
19
review process. It also turns on the line numbers. If you wish to submit a preprint, the
20
option preprint should be used.
21
1.2
Retrieval of style files
22
The style files for COLM and other conference information are available online at:
23
http://www.colmweb.org/
24
The file colm2025_conference.pdf contains these instructions and illustrates the various
25
formatting requirements your COLM paper must satisfy. Submissions must be made using
26
LATEX and the style files colm2025_conference.sty and colm2025_conference.bst (to be
27
used with LATEX2e). The file colm2025_conference.tex may be used as a “shell” for writing
28
your paper. All you have to do is replace the author, title, abstract, and text of the paper
29
with your own.
30
The formatting instructions contained in these style files are summarized in sections 2, 3,
31
and 4 below.
32
1


Under review as a conference paper at COLM 2025
2
General formatting instructions
33
The text must be confined within a rectangle 5.5 inches (33 picas) wide and 9 inches (54 picas)
34
long. The left margin is 1.5 inch (9 picas). Use 10 point type with a vertical spacing of
35
11 points. Palatino is the preferred typeface throughout, and is mandatory for the main text.
36
Paragraphs are separated by 1/2 line space, with no indentation.
37
Paper title is 17 point and left-aligned. All pages should start at 1 inch (6 picas) from the top
38
of the page.
39
Please verify that any custom header information you may add does not override the style
40
defined in this document. This has been known to occur especially when submissions
41
are converted to a new template from a previous one (i.e., for re-submission to a different
42
venue).
43
Authors’ names are set in boldface, and each name is placed above its corresponding address.
44
The lead author’s name is to be listed first, and the co-authors’ names are set to follow.
45
Authors sharing the same address can be on the same line.
46
Please pay special attention to the instructions in section 4 regarding figures, tables, ac-
47
knowledgements, and references.
48
There will be a strict upper limit of 9 pages for the main text of the initial submission, with
49
unlimited additional pages for citations.
50
We strongly recommend following arXiv’s guidelines for making your paper friendly for
51
HTML conversion: https://info.arxiv.org/help/submit latex best practices.html.
52
3
Headings: first level
53
First level headings are in lower case (except for first word and proper nouns), bold face,
54
flush left and in point size 12. One line space before the first level heading and 1/2 line
55
space after the first level heading.
56
3.1
Headings: second level
57
Second level headings are in lower case (except for first word and proper nouns), bold face,
58
flush left and in point size 10. One line space before the second level heading and 1/2 line
59
space after the second level heading.
60
3.1.1
Headings: third level
61
Third level headings are in lower case (except for first word and proper nouns), bold face,
62
italics, flush left and in point size 10. One line space before the third level heading and
63
1/2 line space after the third level heading.
64
4
Citations, figures, tables, references
65
These instructions apply to everyone, regardless of the formatter being used.
66
4.1
Citations within the text
67
Citations within the text should be based on the natbib package and include the authors’ last
68
names and year (with the “et al.” construct for more than two authors). When the authors or
69
the publication are included in the sentence, the citation should not be in parenthesis using
70
\citet{} (as in “See Vaswani et al. (2017) for more information.”). Otherwise, the citation
71
should be in parenthesis using \citep{} (as in “Transformers are a key tool for developing
72
language models (Vaswani et al., 2017).”).
73
2


Under review as a conference paper at COLM 2025
Figure 1: Sample figure caption.
The corresponding references are to be listed in alphabetical order of authors, in the REFER-
74
ENCES section. As to the format of the references themselves, any style is acceptable as long
75
as it is used consistently.
76
4.2
Footnotes
77
Indicate footnotes with a number1 in the text. Place the footnotes at the bottom of the page
78
on which they appear. Precede the footnote with a horizontal rule of 2 inches (12 picas).2
79
4.3
Figures
80
All artwork must be neat, clean, and legible. Lines should be dark enough for purposes
81
of reproduction; art work should not be hand-drawn. Any text within the figure must be
82
readable. We ask to not use font sizes below small. We strongly recommend to use vector
83
representations (e.g., pdf or svg) for all diagrams. We strongly recommend positioning all
84
figures at the top or bottom of the page.
85
The figure number and caption always appear below the figure. Place one line space before
86
the figure caption, and one line space after the figure. The figure caption is lower case
87
(except for first word and proper nouns); figures are numbered consecutively. Make sure
88
the figure caption does not get separated from the figure. Leave sufficient space to avoid
89
splitting the figure and figure caption.
90
You may use color figures. However, it is best for the figure captions and the paper body to
91
make sense if the paper is printed either in black/white or in color.
92
4.4
Tables
93
All tables must be centered, neat, clean and legible. Do not use hand-drawn tables. The
94
table number and title always appear below the table. See Table 1. Please do not use font
95
sizes below small in tables. We recommend using booktabs or a similar package to style
96
tables. We strongly recommend positioning all tables at the top or bottom of the page.
97
Place one line space before the table title, one line space after the table title, and one line
98
space after the table. The table title must be lowercase (except for first word and proper
99
nouns); tables are numbered consecutively.
100
5
Final instructions
101
Do not change any aspects of the formatting parameters in the style files. In particular, do
102
not modify the width or length of the rectangle the text should fit into, and do not change
103
1Sample of the first footnote
2Sample of the second footnote
3


Under review as a conference paper at COLM 2025
PART
DESCRIPTION
Dendrite
Input terminal
Axon
Output terminal
Soma
Cell body (contains cell nucleus)
Table 1: Sample table title
font sizes (except perhaps in the REFERENCES section; see below). Please note that pages
104
should be numbered.
105
6
Preparing PostScript or PDF files
106
Please prepare PostScript or PDF files with paper size “US Letter”, and not, for example,
107
“A4”. The -t letter option on dvips will produce US Letter files.
108
Consider directly generating PDF files using pdflatex (especially if you are a MiKTeX user).
109
PDF figures must be substituted for EPS figures, however.
110
Otherwise, please generate your PostScript and PDF files with the following commands:
111
dvips mypaper.dvi -t letter -Ppdf -G0 -o mypaper.ps
112
ps2pdf mypaper.ps mypaper.pdf
113
6.1
Margins in LaTeX
114
Most of the margin problems come from figures positioned by hand using \special or other
115
commands. We suggest using the command \includegraphics from the graphicx package.
116
Always specify the figure width as a multiple of the line width as in the example below
117
using .eps graphics
118
\usepackage[dvips]{graphicx} ...
119
\includegraphics[width=0.8\linewidth]{myfile.eps}
120
or
121
\usepackage[pdftex]{graphicx} ...
122
\includegraphics[width=0.8\linewidth]{myfile.pdf}
123
for .pdf graphics. See section 4.4 in the graphics bundle documentation (http://www.ctan.
124
org/tex-archive/macros/latex/required/graphics/grfguide.ps)
125
A number of width problems arise when LaTeX cannot properly hyphenate a line. Please
126
give LaTeX hyphenation hints using the \- command.
127
Author Contributions
128
If you’d like to, you may include a section for author contributions as is done in many
129
journals. This is optional and at the discretion of the authors.
130
Acknowledgments
131
Use unnumbered first level headings for the acknowledgments. All acknowledgments,
132
including those to funding agencies, go at the end of the paper.
133
4


Under review as a conference paper at COLM 2025
Ethics Statement
134
Authors can add an optional ethics statement to the paper. For papers that touch on ethical
135
issues, this section will be evaluated as part of the review process. The ethics statement
136
should come at the end of the paper. It does not count toward the page limit, but should not
137
be more than 1 page.
138
References
139
Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N
140
Gomez, Ł ukasz Kaiser, and Illia Polosukhin.
Attention is all you need.
In
141
Advances in Neural Information Processing Systems, volume 30. Curran Associates,
142
Inc., 2017.
URL https://proceedings.neurips.cc/paper files/paper/2017/file/
143
3f5ee243547dee91fbd053c1c4a845aa-Paper.pdf.
144
A
Appendix
145
You may include other additional sections here.
146
5


