
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Settings, Code } from 'lucide-react';
import { teamMembers, aboutContent } from '@/data/about-data';

const iconMap = {
  User,
  Settings,
  Code
};

const TeamMembersSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-16 h-1 bg-drove-accent mb-6 mx-auto"></div>
          <p className="text-drove-accent font-semibold text-lg mb-4">
            {aboutContent.teamMembers.sectionTitle}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {aboutContent.teamMembers.title}
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            {aboutContent.teamMembers.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => {
            const IconComponent = iconMap[member.icon as keyof typeof iconMap];
            return (
              <Card 
                key={index} 
                className={`${member.cardColor} rounded-2xl overflow-hidden border backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300 bg-white`}
              >
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className={`w-16 h-16 ${member.cardColor.includes('green') ? 'bg-green-500/30' : member.cardColor.includes('blue') ? 'bg-blue-500/30' : 'bg-purple-500/30'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <IconComponent 
                        size={32} 
                        className={member.textColor} 
                      />
                    </div>
                    
                    <h3 className={`text-2xl font-bold mb-2 ${member.textColor}`}>
                      {member.name}
                    </h3>
                    
                    <p className={`text-lg font-semibold mb-4 ${member.positionColor}`}>
                      {member.position}
                    </p>
                    
                    <p className={`${member.descriptionColor} leading-relaxed`}>
                      {member.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TeamMembersSection;
