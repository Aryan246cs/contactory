import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ScreenHeader';
import { listContactsByTag } from '@/database/repositories/contactsRepository';
import type { ContactRecord } from '@/types/contact';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';
export default function TagGroup() {
  const { colors } = useTheme(); const { id, name } = useLocalSearchParams<{ id: string; name: string }>(); const [items, setItems] = useState<ContactRecord[]>([]);
  useFocusEffect(useCallback(() => { let active = true; listContactsByTag(id).then((v) => { if (active) setItems(v); }); return () => { active = false; }; }, [id]));
  return <SafeAreaView style={[s.safe,{backgroundColor:colors.canvas}]}><View style={s.body}><ScreenHeader title={name || 'Group'}/><Text style={[s.count,{color:colors.inkSoft}]}>{items.length} {items.length === 1 ? 'person' : 'people'} in this group</Text><FlatList data={items} keyExtractor={(x)=>x.id} ListEmptyComponent={<Text style={[s.empty,{color:colors.muted}]}>No contacts in this group yet. Add this tag while creating or editing a contact.</Text>} renderItem={({item})=><Pressable onPress={()=>router.push({pathname:'/contacts/[id]',params:{id:item.id}})} style={[s.row,{borderBottomColor:colors.border}]}><View style={[s.avatar,{backgroundColor:colors.accentSoft}]}><Text style={{color:colors.accent,fontWeight:'800'}}>{(item.fullName||item.company||'•').slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={[s.name,{color:colors.ink}]}>{item.fullName||item.company||'Unnamed contact'}</Text><Text style={[s.company,{color:colors.inkSoft}]}>{item.company||item.jobTitle||item.email}</Text></View><Text style={{color:colors.muted,fontSize:22}}>›</Text></Pressable>} /></View></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1},body:{flex:1,paddingHorizontal:spacing.xl},count:{fontSize:12,marginTop:4,marginBottom:12},row:{minHeight:70,borderBottomWidth:1,flexDirection:'row',alignItems:'center',gap:12},avatar:{width:40,height:40,borderRadius:14,alignItems:'center',justifyContent:'center'},name:{fontSize:14,fontWeight:'700'},company:{fontSize:11,marginTop:4},empty:{fontSize:13,lineHeight:20,marginTop:28}});
