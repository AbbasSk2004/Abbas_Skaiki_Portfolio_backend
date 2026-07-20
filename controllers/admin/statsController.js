import Project from '../../models/Project.js';
import Service from '../../models/Service.js';
import Testimonial from '../../models/Testimonial.js';
import TechStack from '../../models/TechStack.js';
import Inquiry from '../../models/Inquiry.js';
import CallBooking from '../../models/CallBooking.js';

// -----------------------------------------------------------------------------
// Dashboard analytics aggregator — GET /api/admin/stats  (PRIVATE).
//
// Returns everything the admin dashboard's analytics panels render, in one
// round-trip, in a shape the custom SVG/CSS charts consume directly (no chart
// library — see front/src/app/admin). Each series is a flat [{ label, value }]
// list so a chart component never has to know which model it came from.
//
// All counts run concurrently; a single failed aggregation rejects the whole
// request (caught by catchAsync → globalErrorHandler) rather than returning a
// half-populated dashboard that looks correct but isn't.
// -----------------------------------------------------------------------------

// Bucket a set of timestamped docs into the last `months` calendar months.
// Returns [{ label: 'Feb', value: n }, ...] oldest→newest, always `months`
// long so the chart's x-axis is stable even in a quiet month.
const monthlySeries = (docs, months = 6) => {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('en-US', { month: 'short' }),
      value: 0,
    });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const doc of docs) {
    const c = doc.createdAt ? new Date(doc.createdAt) : null;
    if (!c) continue;
    const bucket = index.get(`${c.getFullYear()}-${c.getMonth()}`);
    if (bucket) bucket.value += 1;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
};

/**
 * GET /api/admin/stats
 * Aggregate counts + time series for the dashboard analytics panels.
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      projectCount,
      serviceCount,
      testimonialCount,
      techStackCount,
      inquiryCount,
      bookingCount,
      inquiryTimestamps,
      bookingsByStatusAgg,
      projectsByCategory,
      recentInquiries,
    ] = await Promise.all([
      Project.countDocuments(),
      Service.countDocuments(),
      Testimonial.countDocuments(),
      TechStack.countDocuments(),
      Inquiry.countDocuments(),
      CallBooking.countDocuments(),
      // Pull only timestamps for the trend chart — keep payload lean.
      Inquiry.find().select('createdAt').lean(),
      // Bookings grouped by their status enum (pending/confirmed/completed).
      CallBooking.aggregate([
        { $group: { _id: { $ifNull: ['$status', 'pending'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Project.aggregate([
        { $group: { _id: { $ifNull: ['$category', 'Uncategorized'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Latest leads for the activity feed — just what the feed renders.
      Inquiry.find().sort({ createdAt: -1 }).limit(6).select('name email createdAt').lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        // Headline KPI cards.
        totals: {
          projects: projectCount,
          services: serviceCount,
          testimonials: testimonialCount,
          techStacks: techStackCount,
          inquiries: inquiryCount,
          bookings: bookingCount,
        },
        // Line/area chart series — last 6 months of lead activity.
        inquiriesByMonth: monthlySeries(inquiryTimestamps, 6),
        // Donut series — bookings by status.
        bookingsByStatus: bookingsByStatusAgg.map((s) => ({
          label: s._id,
          value: s.count,
        })),
        // Horizontal bars — project content distribution.
        projectsByCategory: projectsByCategory.map((c) => ({
          label: c._id,
          value: c.count,
        })),
        // Activity feed.
        recentInquiries,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
