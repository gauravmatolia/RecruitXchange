import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Search, Filter, TrendingUp, MapPin, Briefcase, Star, Building2, DollarSign, Users, ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useToast } from "@/components/ui/use-toast.js";

export default function RoleExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedRoles, setAppliedRoles] = useState(new Set());
  
  const { user, getAuthHeaders, API_BASE_URL } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchRoles();
    fetchUserApplications();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast({
        title: "Error",
        description: "Failed to load job roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/applications?type=role`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const appliedIds = new Set(data.applications.map(app => app.id));
        setAppliedRoles(appliedIds);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const handleViewDetails = (role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedRole(null);
  };

  const handleApply = async (roleId) => {
    if (appliedRoles.has(roleId)) {
      toast({
        title: "Already Applied",
        description: "You have already applied for this role",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/roles/${roleId}/apply`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setAppliedRoles(prev => new Set([...prev, roleId]));
        toast({
          title: "Application Submitted!",
          description: "Your application has been submitted successfully",
        });
        
        // Refresh applications list
        fetchUserApplications();
      } else {
        const error = await response.json();
        toast({
          title: "Application Failed",
          description: error.message || "Failed to submit application",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    }
  };

  const filteredRoles = roles.filter(role =>
    role.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const ApplyButton = ({ roleId, inDialog = false }) => {
    const isApplied = appliedRoles.has(roleId);
    const buttonClass = inDialog 
        ? "bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
        : "flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 group/btn";
    const size = inDialog ? undefined : "lg";
    
    return (
      <Button 
        size={size}
        className={buttonClass}
        onClick={() => handleApply(roleId)}
        disabled={isApplied}
      >
        {isApplied ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Applied
          </>
        ) : (
          <>
            Apply Now
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </>
        )}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-accent to-primary p-10 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Explore Career Opportunities</h1>
              <p className="text-lg text-white/90 mt-1">
                AI-powered role matching • {roles.length}+ active positions
              </p>
            </div>
          </div>

          {/* Enhanced Search */}
          <div className="flex gap-3 max-w-3xl mt-6">
            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-white/70 z-10" />
                <Input
                  placeholder="Search by role, company, skills, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-14 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:border-white/40 rounded-2xl text-base"
                />
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="lg"
              className="h-14 px-6 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 rounded-2xl"
            >
              <Filter className="w-5 h-5 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Briefcase, value: `${roles.length}+`, label: "Active Roles", color: "primary", gradient: "from-primary to-primary/80" },
          { icon: TrendingUp, value: "₹12.5L", label: "Avg Package", color: "success", gradient: "from-success to-success/80" },
          { icon: MapPin, value: "15+", label: "Cities", color: "accent", gradient: "from-accent to-accent/80" },
          { icon: Star, value: "4.8/5", label: "Success Rate", color: "warning", gradient: "from-warning to-warning/80" },
        ].map((stat, index) => (
          <Card 
            key={index}
            className="group bg-gradient-glass border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110`}>
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <stat.icon className="w-7 h-7 text-white relative z-10" />
                </div>
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{filteredRoles.length} Opportunities Found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? `Filtered by "${searchQuery}"` : "Showing all available positions"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Sort by: Relevance</Badge>
        </div>
      </div>

      {/* Premium Role Cards */}
      <div className="grid gap-5">
        {filteredRoles.map((role, index) => (
          <Card 
            key={role._id}
            className="group bg-gradient-glass border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
            style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardContent className="p-7 relative">
              <div className="flex items-start gap-6">
                {/* Company Logo */}
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-card to-muted/50 flex items-center justify-center text-4xl border border-border/50 shadow-lg">
                    {role.companyLogo || "🏢"}
                  </div>
                </div>

                {/* Role Details */}
                <div className="flex-1 min-w-0">
                  {/* Title Row */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                          {role.title}
                        </h3>
                        {role.featured && (
                          <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-lg shadow-primary/30">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {role.matchScore}% Match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Building2 className="w-4 h-4" />
                          {role.company}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          {role.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {role.applicants} applicants
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {role.description}
                  </p>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/30 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Salary Range
                      </p>
                      <p className="text-lg font-bold text-primary flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {role.salary}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Experience
                      </p>
                      <p className="text-lg font-bold">{role.experience}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {role.skills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="outline" 
                        className="px-3 py-1 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 border-primary/20 transition-colors"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => handleViewDetails(role)} 
                      className="flex-1 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                    >
                      View Details
                    </Button>
                    <ApplyButton roleId={role._id} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {filteredRoles.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="lg" className="px-8">
            Load More Opportunities
          </Button>
        </div>
      )}

      {/* Role Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-4xl p-0 max-h-[90vh] overflow-y-auto">
              {selectedRole && (
                  <>
                      <DialogHeader className="p-6 pb-0">
                          <DialogTitle className="text-3xl font-bold text-primary">{selectedRole.title}</DialogTitle>
                          <DialogDescription className="text-lg text-muted-foreground pt-1">
                              {selectedRole.company} | {selectedRole.location}
                          </DialogDescription>
                      </DialogHeader>

                      <div className="p-6 pt-0 space-y-6">
                          {/* Basic Info */}
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-4">
                              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" />{selectedRole.salary}</span>
                              <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{selectedRole.experience}</span>
                              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{selectedRole.applicants} applicants</span>
                              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                                {selectedRole.matchScore}% Match
                              </Badge>
                          </div>

                          {/* Responsibilities */}
                          {selectedRole.responsibilities && selectedRole.responsibilities.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3 border-l-4 border-primary pl-3">Responsibilities</h3>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    {selectedRole.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                            </div>
                          )}

                          {/* Qualifications */}
                          {selectedRole.qualifications && selectedRole.qualifications.length > 0 && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3 border-l-4 border-primary pl-3">Required Qualifications</h3>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    {selectedRole.qualifications.map((q, i) => <li key={i}>{q}</li>)}
                                </ul>
                            </div>
                          )}
                          
                          {/* Culture */}
                          {selectedRole.companyCulture && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3 border-l-4 border-primary pl-3">Company Culture</h3>
                                <p className="text-muted-foreground">{selectedRole.companyCulture}</p>
                            </div>
                          )}

                          {/* Skills */}
                          <div>
                              <h3 className="text-xl font-semibold mb-3 border-l-4 border-primary pl-3">Key Skills</h3>
                              <div className="flex flex-wrap gap-2">
                                  {selectedRole.skills.map((skill) => (
                                      <Badge key={skill} variant="secondary">{skill}</Badge>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Dialog Footer with Apply Button */}
                      <div className="sticky bottom-0 bg-card p-4 border-t flex justify-end">
                          <Button onClick={handleCloseDialog} variant="outline" className="mr-3">Close</Button>
                          <ApplyButton roleId={selectedRole._id} inDialog={true} />
                      </div>
                  </>
              )}
          </DialogContent>
      </Dialog>
    </div>
  );
}