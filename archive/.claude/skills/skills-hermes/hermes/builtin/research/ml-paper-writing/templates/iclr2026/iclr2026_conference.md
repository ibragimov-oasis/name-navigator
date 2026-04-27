000
001
002
003
004
005
006
007
008
009
010
011
012
013
014
015
016
017
018
019
020
021
022
023
024
025
026
027
028
029
030
031
032
033
034
035
036
037
038
039
040
041
042
043
044
045
046
047
048
049
050
051
052
053
Under review as a conference paper at ICLR 2026
FORMATTING INSTRUCTIONS FOR ICLR 2026
CONFERENCE SUBMISSIONS
Anonymous authors
Paper under double-blind review
ABSTRACT
The abstract paragraph should be indented 1/2 inch (3 picas) on both left and right-
hand margins. Use 10 point type, with a vertical spacing of 11 points. The word
ABSTRACT must be centered, in small caps, and in point size 12. Two line spaces
precede the abstract. The abstract must be limited to one paragraph.
1
SUBMISSION OF CONFERENCE PAPERS TO ICLR 2026
ICLR requires electronic submissions, processed by https://openreview.net/. See ICLR’s
website for more instructions.
If your paper is ultimately accepted, the statement \iclrfinalcopy should be inserted to adjust
the format to the camera ready requirements.
The format for the submissions is a variant of the NeurIPS format. Please read carefully the instruc-
tions below, and follow them faithfully.
1.1
STYLE
Papers to be submitted to ICLR 2026 must be prepared according to the instructions presented here.
Authors are required to use the ICLR LATEX style files obtainable at the ICLR website. Please make
sure you use the current files and not previous versions. Tweaking the style files may be grounds for
rejection.
1.2
RETRIEVAL OF STYLE FILES
The style files for ICLR and other conference information are available online at:
http://www.iclr.cc/
The file iclr2026_conference.pdf contains these instructions and illustrates the various
formatting requirements your ICLR paper must satisfy. Submissions must be made using LATEX and
the style files iclr2026_conference.sty and iclr2026_conference.bst (to be used
with LATEX2e). The file iclr2026_conference.tex may be used as a “shell” for writing your
paper. All you have to do is replace the author, title, abstract, and text of the paper with your own.
The formatting instructions contained in these style files are summarized in sections 2, 3, and 4
below.
2
GENERAL FORMATTING INSTRUCTIONS
The text must be confined within a rectangle 5.5 inches (33 picas) wide and 9 inches (54 picas) long.
The left margin is 1.5 inch (9 picas). Use 10 point type with a vertical spacing of 11 points. Times
New Roman is the preferred typeface throughout. Paragraphs are separated by 1/2 line space, with
no indentation.
Paper title is 17 point, in small caps and left-aligned. All pages should start at 1 inch (6 picas) from
the top of the page.
1


054
055
056
057
058
059
060
061
062
063
064
065
066
067
068
069
070
071
072
073
074
075
076
077
078
079
080
081
082
083
084
085
086
087
088
089
090
091
092
093
094
095
096
097
098
099
100
101
102
103
104
105
106
107
Under review as a conference paper at ICLR 2026
Authors’ names are set in boldface, and each name is placed above its corresponding address. The
lead author’s name is to be listed first, and the co-authors’ names are set to follow. Authors sharing
the same address can be on the same line.
Please pay special attention to the instructions in section 4 regarding figures, tables, acknowledg-
ments, and references.
There will be a strict upper limit of 9 pages for the main text of the initial submission, with unlimited
additional pages for citations. This limit will be expanded to 10 pages for rebuttal/camera ready.
3
HEADINGS: FIRST LEVEL
First level headings are in small caps, flush left and in point size 12. One line space before the first
level heading and 1/2 line space after the first level heading.
3.1
HEADINGS: SECOND LEVEL
Second level headings are in small caps, flush left and in point size 10. One line space before the
second level heading and 1/2 line space after the second level heading.
3.1.1
HEADINGS: THIRD LEVEL
Third level headings are in small caps, flush left and in point size 10. One line space before the third
level heading and 1/2 line space after the third level heading.
4
CITATIONS, FIGURES, TABLES, REFERENCES
These instructions apply to everyone, regardless of the formatter being used.
4.1
CITATIONS WITHIN THE TEXT
Citations within the text should be based on the natbib package and include the authors’ last names
and year (with the “et al.” construct for more than two authors). When the authors or the publication
are included in the sentence, the citation should not be in parenthesis using \citet{} (as in “See
Hinton et al. (2006) for more information.”). Otherwise, the citation should be in parenthesis using
\citep{} (as in “Deep learning shows promise to make progress towards AI (Bengio & LeCun,
2007).”).
The corresponding references are to be listed in alphabetical order of authors, in the REFERENCES
section. As to the format of the references themselves, any style is acceptable as long as it is used
consistently.
4.2
FOOTNOTES
Indicate footnotes with a number1 in the text. Place the footnotes at the bottom of the page on which
they appear. Precede the footnote with a horizontal rule of 2 inches (12 picas).2
4.3
FIGURES
All artwork must be neat, clean, and legible. Lines should be dark enough for purposes of repro-
duction; art work should not be hand-drawn. The figure number and caption always appear after the
figure. Place one line space before the figure caption, and one line space after the figure. The figure
caption is lower case (except for first word and proper nouns); figures are numbered consecutively.
Make sure the figure caption does not get separated from the figure. Leave sufficient space to avoid
splitting the figure and figure caption.
1Sample of the first footnote
2Sample of the second footnote
2


108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
Under review as a conference paper at ICLR 2026
Table 1: Sample table title
PART
DESCRIPTION
Dendrite
Input terminal
Axon
Output terminal
Soma
Cell body (contains cell nucleus)
You may use color figures. However, it is best for the figure captions and the paper body to make
sense if the paper is printed either in black/white or in color.
Figure 1: Sample figure caption.
4.4
TABLES
All tables must be centered, neat, clean and legible. Do not use hand-drawn tables. The table number
and title always appear before the table. See Table 1.
Place one line space before the table title, one line space after the table title, and one line space after
the table. The table title must be lower case (except for first word and proper nouns); tables are
numbered consecutively.
5
DEFAULT NOTATION
In an attempt to encourage standardized notation, we have included the notation file from
the textbook, Deep Learning Goodfellow et al. (2016) available at https://github.com/
goodfeli/dlbook_notation/. Use of this style is not required and can be disabled by com-
menting out math commands.tex.
Numbers and Arrays
3


162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
181
182
183
184
185
186
187
188
189
190
191
192
193
194
195
196
197
198
199
200
201
202
203
204
205
206
207
208
209
210
211
212
213
214
215
Under review as a conference paper at ICLR 2026
a
A scalar (integer or real)
a
A vector
A
A matrix
A
A tensor
In
Identity matrix with n rows and n columns
I
Identity matrix with dimensionality implied by context
e(i)
Standard basis vector [0, . . . , 0, 1, 0, . . . , 0] with a 1 at po-
sition i
diag(a)
A square, diagonal matrix with diagonal entries given by a
a
A scalar random variable
a
A vector-valued random variable
A
A matrix-valued random variable
Sets and Graphs
A
A set
R
The set of real numbers
{0, 1}
The set containing 0 and 1
{0, 1, . . . , n}
The set of all integers between 0 and n
[a, b]
The real interval including a and b
(a, b]
The real interval excluding a but including b
A\B
Set subtraction, i.e., the set containing the elements of A
that are not in B
G
A graph
PaG(xi)
The parents of xi in G
Indexing
ai
Element i of vector a, with indexing starting at 1
a−i
All elements of vector a except for element i
Ai,j
Element i, j of matrix A
Ai,:
Row i of matrix A
A:,i
Column i of matrix A
Ai,j,k
Element (i, j, k) of a 3-D tensor A
A:,:,i
2-D slice of a 3-D tensor
ai
Element i of the random vector a
Calculus
4


216
217
218
219
220
221
222
223
224
225
226
227
228
229
230
231
232
233
234
235
236
237
238
239
240
241
242
243
244
245
246
247
248
249
250
251
252
253
254
255
256
257
258
259
260
261
262
263
264
265
266
267
268
269
Under review as a conference paper at ICLR 2026
dy
dx
Derivative of y with respect to x
∂y
∂x
Partial derivative of y with respect to x
∇xy
Gradient of y with respect to x
∇Xy
Matrix derivatives of y with respect to X
∇Xy
Tensor containing derivatives of y with respect to X
∂f
∂x
Jacobian matrix J ∈Rm×n of f : Rn →Rm
∇2
xf(x) or H(f)(x)
The Hessian matrix of f at input point x
Z
f(x)dx
Definite integral over the entire domain of x
Z
S
f(x)dx
Definite integral with respect to x over the set S
Probability and Information Theory
P(a)
A probability distribution over a discrete variable
p(a)
A probability distribution over a continuous variable, or
over a variable whose type has not been specified
a ∼P
Random variable a has distribution P
Ex∼P [f(x)] or Ef(x)
Expectation of f(x) with respect to P(x)
Var(f(x))
Variance of f(x) under P(x)
Cov(f(x), g(x))
Covariance of f(x) and g(x) under P(x)
H(x)
Shannon entropy of the random variable x
DKL(P∥Q)
Kullback-Leibler divergence of P and Q
N(x; µ, Σ)
Gaussian distribution over x with mean µ and covariance
Σ
Functions
f : A →B
The function f with domain A and range B
f ◦g
Composition of the functions f and g
f(x; θ)
A function of x parametrized by θ. (Sometimes we write
f(x) and omit the argument θ to lighten notation)
log x
Natural logarithm of x
σ(x)
Logistic sigmoid,
1
1 + exp(−x)
ζ(x)
Softplus, log(1 + exp(x))
||x||p
Lp norm of x
||x||
L2 norm of x
x+
Positive part of x, i.e., max(0, x)
1condition
is 1 if the condition is true, 0 otherwise
5


270
271
272
273
274
275
276
277
278
279
280
281
282
283
284
285
286
287
288
289
290
291
292
293
294
295
296
297
298
299
300
301
302
303
304
305
306
307
308
309
310
311
312
313
314
315
316
317
318
319
320
321
322
323
Under review as a conference paper at ICLR 2026
6
FINAL INSTRUCTIONS
Do not change any aspects of the formatting parameters in the style files. In particular, do not modify
the width or length of the rectangle the text should fit into, and do not change font sizes (except
perhaps in the REFERENCES section; see below). Please note that pages should be numbered.
7
PREPARING POSTSCRIPT OR PDF FILES
Please prepare PostScript or PDF files with paper size “US Letter”, and not, for example, “A4”. The
-t letter option on dvips will produce US Letter files.
Consider directly generating PDF files using pdflatex (especially if you are a MiKTeX user).
PDF figures must be substituted for EPS figures, however.
Otherwise, please generate your PostScript and PDF files with the following commands:
dvips mypaper.dvi -t letter -Ppdf -G0 -o mypaper.ps
ps2pdf mypaper.ps mypaper.pdf
7.1
MARGINS IN LATEX
Most of the margin problems come from figures positioned by hand using \special or other
commands. We suggest using the command \includegraphics from the graphicx package.
Always specify the figure width as a multiple of the line width as in the example below using .eps
graphics
\usepackage[dvips]{graphicx} ...
\includegraphics[width=0.8\linewidth]{myfile.eps}
or
\usepackage[pdftex]{graphicx} ...
\includegraphics[width=0.8\linewidth]{myfile.pdf}
for .pdf graphics. See section 4.4 in the graphics bundle documentation (http://www.ctan.
org/tex-archive/macros/latex/required/graphics/grfguide.ps)
A number of width problems arise when LaTeX cannot properly hyphenate a line. Please give
LaTeX hyphenation hints using the \- command.
AUTHOR CONTRIBUTIONS
If you’d like to, you may include a section for author contributions as is done in many journals. This
is optional and at the discretion of the authors.
ACKNOWLEDGMENTS
Use unnumbered third level headings for the acknowledgments. All acknowledgments, including
those to funding agencies, go at the end of the paper.
REFERENCES
Yoshua Bengio and Yann LeCun. Scaling learning algorithms towards AI. In Large Scale Kernel
Machines. MIT Press, 2007.
Ian Goodfellow, Yoshua Bengio, Aaron Courville, and Yoshua Bengio. Deep learning, volume 1.
MIT Press, 2016.
Geoffrey E. Hinton, Simon Osindero, and Yee Whye Teh. A fast learning algorithm for deep belief
nets. Neural Computation, 18:1527–1554, 2006.
6


324
325
326
327
328
329
330
331
332
333
334
335
336
337
338
339
340
341
342
343
344
345
346
347
348
349
350
351
352
353
354
355
356
357
358
359
360
361
362
363
364
365
366
367
368
369
370
371
372
373
374
375
376
377
Under review as a conference paper at ICLR 2026
A
APPENDIX
You may include other additional sections here.
7


