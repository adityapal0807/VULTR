# Generated by Django 4.1 on 2024-04-12 14:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_remove_rule_rules_json'),
    ]

    operations = [
        migrations.CreateModel(
            name='Queries',
            fields=[
                ('basemodel_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='api.basemodel')),
                ('query', models.TextField()),
                ('category', models.CharField(max_length=100)),
                ('admin_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='admin_id', to='api.admin_users')),
            ],
            bases=('api.basemodel',),
        ),
    ]
